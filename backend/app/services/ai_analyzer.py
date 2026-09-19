import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI


# ============================================================
# CONFIGURATION
# ============================================================

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")

if not API_KEY:
    raise RuntimeError(
        "Erreur : OPENROUTER_API_KEY n'est pas définie dans .env"
    )


# ============================================================
# CLIENT OPENROUTER
# ============================================================

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY
)


VALID_RISK_LEVELS = {"low", "medium", "high", "critical"}


# ============================================================
# STRUCTURE PAR DÉFAUT (garantit que le frontend a toujours
# toutes les clés attendues, même en cas d'erreur ou de
# réponse IA mal formée)
# ============================================================

def _empty_analysis() -> dict:
    return {
        "summary": "",
        "risk_level": "unknown",
        "risk_justification": "",
        "risk_points": [],
        "ports": [],
        "observations": [],
        "recommendations": [],
        "limitations": "",
        "parse_error": None,
    }


def _fallback_analysis(target: str, open_ports: list, raw_text: str = None, error_msg: str = None) -> dict:
    analysis = _empty_analysis()

    if error_msg:
        analysis["summary"] = (
            f"L'analyse IA n'a pas pu être générée pour {target}."
        )
        analysis["parse_error"] = error_msg
    elif raw_text:
        analysis["summary"] = raw_text[:2000]
        analysis["parse_error"] = (
            "La réponse de l'IA n'était pas dans le format JSON attendu ; "
            "le texte brut est affiché tel quel dans le résumé."
        )

    analysis["ports"] = [
        {
            "port": p,
            "protocol": "tcp",
            "service": "inconnu",
            "description": "",
            "risk": "unknown",
        }
        for p in open_ports
    ]

    return analysis


def _extract_json(text: str) -> dict:
    """
    Extrait un objet JSON depuis la réponse du modèle, même si
    celui-ci l'a entouré de balises ```json ... ``` ou de texte
    autour.
    """

    # Retire les éventuelles balises de code
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Dernier recours : on cherche le plus grand bloc { ... }
    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        return json.loads(match.group(0))

    raise ValueError("Aucun JSON valide trouvé dans la réponse.")


def _normalize(analysis: dict, open_ports: list) -> dict:
    """
    S'assure que toutes les clés attendues sont présentes et bien
    typées, quitte à compléter avec des valeurs par défaut.
    """

    result = _empty_analysis()

    result["summary"] = str(analysis.get("summary", ""))

    risk_level = str(analysis.get("risk_level", "unknown")).lower()
    result["risk_level"] = risk_level if risk_level in VALID_RISK_LEVELS else "unknown"

    result["risk_justification"] = str(analysis.get("risk_justification", ""))
    result["risk_points"] = [str(x) for x in analysis.get("risk_points", []) if x]

    ports = analysis.get("ports", [])
    normalized_ports = []
    for p in ports:
        if not isinstance(p, dict):
            continue
        risk = str(p.get("risk", "unknown")).lower()
        normalized_ports.append({
            "port": p.get("port"),
            "protocol": str(p.get("protocol", "tcp")),
            "service": str(p.get("service", "inconnu")),
            "description": str(p.get("description", "")),
            "risk": risk if risk in VALID_RISK_LEVELS else "unknown",
        })
    # Si l'IA a oublié un port pourtant ouvert, on l'ajoute quand même
    covered = {p["port"] for p in normalized_ports}
    for p in open_ports:
        if p not in covered:
            normalized_ports.append({
                "port": p, "protocol": "tcp", "service": "inconnu",
                "description": "", "risk": "unknown",
            })
    result["ports"] = normalized_ports

    result["observations"] = [str(x) for x in analysis.get("observations", []) if x]

    recos = analysis.get("recommendations", [])
    normalized_recos = []
    for r in recos:
        if not isinstance(r, dict):
            continue
        commands = r.get("commands", [])
        normalized_recos.append({
            "title": str(r.get("title", "")),
            "justification": str(r.get("justification", "")),
            "commands": [str(c) for c in commands if c] if isinstance(commands, list) else [],
        })
    result["recommendations"] = normalized_recos

    result["limitations"] = str(analysis.get("limitations", ""))
    result["parse_error"] = None

    return result


# ============================================================
# ANALYSE IA
# ============================================================

def analyze_scan(target: str, open_ports: list) -> dict:
    """
    Envoie les résultats du scan à OpenRouter et retourne une
    analyse de sécurité structurée (dict JSON), prête à être
    affichée telle quelle par le frontend ou formatée pour le
    terminal.
    """

    scan_data = {
        "target": target,
        "open_ports": open_ports,
        "number_of_open_ports": len(open_ports),
    }

    prompt = f"""
Tu es un analyste cybersécurité spécialisé dans l'analyse défensive
des réseaux.

Les données suivantes proviennent d'un scan de ports réalisé dans un
environnement de laboratoire autorisé.

DONNÉES DU SCAN :

{json.dumps(scan_data, indent=2, ensure_ascii=False)}

Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant
ou après, sans balises de code (pas de ```), respectant EXACTEMENT
ce schéma :

{{
  "summary": "résumé court du scan, en français",
  "risk_level": "low | medium | high | critical",
  "risk_justification": "justification du niveau de risque global, en français",
  "risk_points": ["point d'attention 1", "point d'attention 2"],
  "ports": [
    {{
      "port": 22,
      "protocol": "tcp",
      "service": "nom du service probable",
      "description": "description en français du service et de ses risques",
      "risk": "low | medium | high | critical"
    }}
  ],
  "observations": ["observation de sécurité 1", "observation de sécurité 2"],
  "recommendations": [
    {{
      "title": "titre court de la recommandation, en français",
      "justification": "pourquoi cette recommandation, en français",
      "commands": ["commande shell exacte 1", "commande shell exacte 2"]
    }}
  ],
  "limitations": "limites de ce simple scan SYN, en français"
}}

RÈGLES IMPORTANTES :
- "risk_level" et le "risk" de chaque port DOIVENT être exactement
  l'un de : low, medium, high, critical (en anglais, en minuscules).
- Un port ouvert n'est pas automatiquement une vulnérabilité.
- Le numéro de port ne permet pas de confirmer avec certitude le
  service réellement exécuté ; utilise "probablement" dans les
  descriptions quand c'est une déduction.
- "commands" doit contenir de VRAIES commandes shell/Linux
  utilisables telles quelles pour sécuriser ou vérifier le service
  concerné (ex: règles ufw/iptables, configuration sshd_config,
  désactivation d'un service, mise à jour). Ne propose AUCUNE
  commande offensive ou d'exploitation.
- Chaque recommandation défensive doit avoir au moins une commande
  quand c'est pertinent (sinon "commands" peut être une liste vide).
- Sois précis, concret et pédagogique.
- N'ajoute AUCUNE clé en dehors du schéma ci-dessus.
"""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Tu es un expert en cybersécurité spécialisé dans "
                        "l'analyse défensive des réseaux. Tu réponds "
                        "uniquement en JSON valide, sans aucun texte "
                        "autour."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )

        result = response.choices[0].message.content

        if not result:
            return _fallback_analysis(target, open_ports, error_msg="L'IA n'a retourné aucune réponse.")

        try:
            parsed = _extract_json(result)
        except (ValueError, json.JSONDecodeError):
            return _fallback_analysis(target, open_ports, raw_text=result)

        return _normalize(parsed, open_ports)

    except Exception as e:
        return _fallback_analysis(target, open_ports, error_msg=str(e))
