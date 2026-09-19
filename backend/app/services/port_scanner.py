from scapy.all import IP, TCP, sr1, send


def scan_port(target, port, timeout=1):
    """
    Scanne un port spécifique sur la cible.

    Retourne True si le port est ouvert,
    False sinon.
    """

    # Création du paquet SYN
    pkt = IP(dst=target) / TCP(
        dport=port,
        flags="S"
    )

    # Envoi du paquet et réception de la réponse
    resp = sr1(
        pkt,
        timeout=timeout,
        verbose=0
    )

    if resp is None:
        return False

    if resp.haslayer(TCP):

        # SYN-ACK = port ouvert
        if resp.getlayer(TCP).flags == 0x12:

            # Envoi d'un RST pour fermer la connexion
            send(
                IP(dst=target) /
                TCP(dport=port, flags="R"),
                verbose=0
            )

            return True

    return False


def port_scan(target, ports, timeout=1, on_progress=None):
    """
    Scanne une liste de ports.

    on_progress(current_port, ports_scanned, total_ports) est appelé
    après chaque port testé, si fourni (utilisé pour remonter la
    progression au frontend).
    """

    open_ports = []

    # ports peut être un range() : on le matérialise pour connaître
    # le total et pouvoir itérer avec un index.
    ports = list(ports)
    total_ports = len(ports)

    for i, port in enumerate(ports, start=1):

        print(
            f"Analyse du port {port}...",
            end=" "
        )

        if scan_port(target, port, timeout):

            open_ports.append(port)

            print("OUVERT")

        else:

            print("fermé / filtré")

        if on_progress:
            on_progress(port, i, total_ports)

    return open_ports


def parse_ports(port_argument):
    """
    Transforme :

    80
    80,443,8080
    1-1024

    en une liste de ports.
    """

    if "," in port_argument:

        return [
            int(port)
            for port in port_argument.split(",")
        ]

    if "-" in port_argument:

        start, end = map(
            int,
            port_argument.split("-")
        )

        return range(
            start,
            end + 1
        )

    return [int(port_argument)]
