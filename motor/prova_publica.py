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

    def test_flux_d_issue(self):
        self.assertEqual(publica.branca("#12", "fix(xat): arregla el vot (#12)"), "issue/12-arregla-el-vot")
        publica.valida_missatge("#12", "fix(xat): arregla el vot (#12)")
        with self.assertRaises(SystemExit):
            publica.valida_missatge("#12", "fix(xat): arregla el vot (g12)")

    def test_git_status_z(self):
        sortida = " M motor/a.py\0?? docs/nou fitxer.md\0R  motor/nou.py\0motor/vell.py\0"
        self.assertEqual(publica.porcelain_z(sortida), ["motor/a.py", "docs/nou fitxer.md", "motor/nou.py"])

    def test_main_de_cap_a_cap_en_un_repo_temporal(self):
        import os, subprocess, tempfile
        g = lambda cwd, *a: subprocess.run(["git", *a], cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()
        with tempfile.TemporaryDirectory() as t:
            t = Path(t)
            g(t, "init", "-q", "--bare", "-b", "main", "origen.git")
            g(t, "clone", "-q", str(t / "origen.git"), "repo")
            r = t / "repo"
            g(r, "config", "user.email", "prova@exemple.cat"); g(r, "config", "user.name", "Prova")
            (r / "motor").mkdir()
            (r / "motor" / "mons.json").write_text("[]\n")
            (r / "motor" / "tot.py").write_text("print('tot ok')\n")
            (r / "motor" / "revisa-mon.js").write_text("process.exit(0)\n")
            (r / "README.md").write_text("prova\n")
            g(r, "add", "-A"); g(r, "commit", "-q", "-m", "inici"); g(r, "push", "-q", "origin", "HEAD:main")
            main0 = g(r, "rev-parse", "HEAD")
            stubs = t / "stubs"; stubs.mkdir(); registre = t / "crides.txt"
            (stubs / "gh").write_text(f'''#!/bin/sh
echo "gh $*" >> "{registre}"
case "$*" in
  *"--json mergeable"*) echo MERGEABLE ;;
  "pr view"*) exit 1 ;;
  "pr create"*) echo https://github.com/x/y/pull/1 ;;
esac
exit 0
''')
            (stubs / "nucli").write_text(f'''#!/bin/sh
echo "nucli $*" >> "{registre}"
case "$*" in "ship plan --json") echo '{{"automatics":[{{"check":"generat"}}]}}' ;; esac
exit 0
''')
            for f in ("gh", "nucli"):
                (stubs / f).chmod(0o755)
            arrel0, path0 = publica.ARREL, os.environ["PATH"]
            branca_real = g(arrel0, "rev-parse", "--abbrev-ref", "HEAD")   # el repo de veritat no s'ha de tocar mai
            publica.ARREL, os.environ["PATH"] = r, f"{stubs}:{path0}"
            try:
                # 1) un fitxer nou que no és de la feina atura abans de fer res
                (r / "notes.txt").write_text("privat\n")
                with self.assertRaises(SystemExit) as e:
                    publica.main(["--id", "g99", "--missatge", "docs(prova): una prova (g99)"])
                self.assertIn("no són de la feina", str(e.exception))
                (r / "notes.txt").unlink()
                # 2) de main: crea la branca, fa el commit, puja la branca (mai main) i activa la fusió automàtica
                (r / "docs").mkdir(); (r / "docs" / "nou.md").write_text("doc\n")
                publica.main(["--id", "g99", "--missatge", "docs(prova): una prova (g99)"])
                self.assertEqual(g(r, "rev-parse", "--abbrev-ref", "HEAD"), "g99-una-prova")
                self.assertIn("refs/heads/g99-una-prova", g(t / "origen.git", "for-each-ref", "--format=%(refname)"))
                self.assertEqual(g(t / "origen.git", "rev-parse", "main"), main0, "main de l'origen no s'ha tocat")
                crides = registre.read_text()
                self.assertIn("nucli ship run generat", crides)
                self.assertIn("gh pr merge https://github.com/x/y/pull/1 --auto --squash --delete-branch", crides)
                # 3) en una branca d'una altra tasca s'atura
                g(r, "checkout", "-q", "-b", "g98-una-altra")
                with self.assertRaises(SystemExit) as e:
                    publica.main(["--id", "g99", "--missatge", "docs(prova): una altra (g99)"])
                self.assertIn("no és de g99", str(e.exception))
            finally:
                publica.ARREL, os.environ["PATH"] = arrel0, path0
            self.assertEqual(g(arrel0, "rev-parse", "--abbrev-ref", "HEAD"), branca_real, "la prova ha canviat la branca del repo de veritat")

    def test_missatge_ha_de_portar_l_id(self):
        with self.assertRaises(SystemExit):
            publica.valida_missatge("g40", "feat(mons): afegeix un món")
        publica.valida_missatge("g40", "feat(mons): afegeix un món (g40)")


if __name__ == "__main__":
    unittest.main()
