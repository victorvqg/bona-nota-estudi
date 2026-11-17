"""Prova de les peces amb lògica de motor/publica.py (sense git ni xarxa).

Ús: python3 motor/prova_publica.py
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import publica  # noqa: E402

MONS = [{"dades": "socials", "carpeta": "sociales/t3-clima"}, {"dades": "geosfera", "carpeta": "bio-i-geo/geosfera"},
        {"dades": "biogeo", "carpeta": "bio-i-geo/univers"}]


class ProvaPublica(unittest.TestCase):
    def test_branca_surt_de_l_id_i_del_missatge(self):
        self.assertEqual(publica.branca("g40", "feat(mons): afegeix el món 9 Volcans i Terratrèmols (g40)"),
                         "g40-afegeix-el-mon-9-volcans-i-terratremols")

    def test_branca_curta_i_sense_simbols(self):
        b = publica.branca("g41", "fix(admin): «Geosfera» · color taronja & més coses que fan el nom massa llarg (g41)")
        self.assertTrue(b.startswith("g41-") and len(b) <= 44 and all(c.isalnum() or c == "-" for c in b), b)

    def test_mons_canviats_per_carpeta_i_per_dades(self):
        fitxers = ["bio-i-geo/geosfera/index.html", "motor/dades/socials.js", "docs/MONS.md", "bio-i-geo/univers-no/x"]
        self.assertEqual(publica.mons_canviats(fitxers, MONS), ["sociales/t3-clima", "bio-i-geo/geosfera"])

    def test_cap_mon_si_nomes_canvien_docs(self):
        self.assertEqual(publica.mons_canviats(["docs/NOU-MON.md", "README.md"], MONS), [])

    def test_detecta_marques_de_conflicte(self):
        textos = {"a.yml": "x\n<<<<<<< HEAD\nu\n=======\nv\n>>>>>>> origin/main\n", "b.md": "Títol\n=======\ntext\n",
                  "c.js": "const a = 1;\n"}
        self.assertEqual(publica.marques_conflicte(textos), ["a.yml"])

    def test_missatge_ha_de_portar_l_id(self):
        with self.assertRaises(SystemExit):
            publica.valida_missatge("g40", "feat(mons): afegeix un món")
        publica.valida_missatge("g40", "feat(mons): afegeix un món (g40)")


if __name__ == "__main__":
    unittest.main()
