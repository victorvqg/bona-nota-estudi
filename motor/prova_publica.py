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

    def test_fitxers_nous_de_fora_de_la_feina(self):
        nous = ["motor/x.py", "notes.txt", "bio-i-geo/volcans/index.html", ".env", "docs/a.md", "export-drive/tema.pdf"]
        self.assertEqual(publica.fitxers_estranys(nous, ["bio-i-geo/volcans", "sociales/t3-clima"]),
                         [".env", "export-drive/tema.pdf", "notes.txt"])

    def test_canvis_de_configuracio(self):
        canviats = [".github/workflows/revisa.yml", "motor/x.py", "CLAUDE.md", ".claude/skills/nou-mon/SKILL.md", "nucli.json", "docs/a.md"]
        self.assertEqual(publica.fitxers_config(canviats),
                         [".claude/skills/nou-mon/SKILL.md", ".github/workflows/revisa.yml", "CLAUDE.md", "nucli.json"])

    def test_base_desfasada_amb_un_repo_de_veritat(self):
        import subprocess, tempfile
        g = lambda cwd, *a: subprocess.run(["git", *a], cwd=cwd, check=True, capture_output=True, text=True)
        with tempfile.TemporaryDirectory() as t:
            t = Path(t)
            g(t, "init", "-q", "--bare", "-b", "main", "origen.git")
            for nom in ("a", "b"):
                g(t, "clone", "-q", str(t / "origen.git"), nom)
                g(t / nom, "config", "user.email", "prova@exemple.cat")
                g(t / nom, "config", "user.name", "Prova")
            (t / "a" / "f.txt").write_text("1\n")
            g(t / "a", "add", "f.txt"); g(t / "a", "commit", "-q", "-m", "u"); g(t / "a", "push", "-q", "origin", "HEAD:main")
            g(t / "b", "pull", "-q", "origin", "main")
            self.assertFalse(publica.base_desfasada(t / "b"), "al dia")
            (t / "a" / "f.txt").write_text("2\n")
            g(t / "a", "commit", "-q", "-am", "dos"); g(t / "a", "push", "-q", "origin", "HEAD:main")
            g(t / "b", "fetch", "-q", "origin", "main")
            self.assertTrue(publica.base_desfasada(t / "b"), "main ha avançat a GitHub i aquí no")
            g(t / "b", "pull", "-q", "--ff-only", "origin", "main")
            self.assertFalse(publica.base_desfasada(t / "b"), "després del pull, al dia")

    def test_missatge_ha_de_portar_l_id(self):
        with self.assertRaises(SystemExit):
            publica.valida_missatge("g40", "feat(mons): afegeix un món")
        publica.valida_missatge("g40", "feat(mons): afegeix un món (g40)")


if __name__ == "__main__":
    unittest.main()
