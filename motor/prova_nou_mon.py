"""Prova de motor/nou_mon.py, en una còpia temporal de motor/ (no toca el repo).

Ús: python3 -m unittest motor/prova_nou_mon.py
"""
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

D = Path(__file__).resolve().parent
sys.path.insert(0, str(D))
import nou_mon  # noqa: E402

ARGS = ["--id", "volcans", "--carpeta", "bio-i-geo/volcans", "--materia", "Biologia i Geologia", "--titol", "Volcans",
        "--desc", "Com neix un volcà.", "--colors", "#1c1917,#dc2626,#fb923c", "--ic", "🌋", "--curt", "Volcans",
        "--spr", "volca", "--xat", "el magma|la lava|el cràter"]


class ProvaNouMon(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        shutil.copy(D / "mons.json", self.tmp / "mons.json")
        (self.tmp / "dades").mkdir()

    def tearDown(self):
        shutil.rmtree(self.tmp)

    def test_crea_entrada_i_esquelet(self):
        abans = json.loads((self.tmp / "mons.json").read_text())
        nou = nou_mon.crea(ARGS, self.tmp)
        mons = json.loads((self.tmp / "mons.json").read_text())
        self.assertEqual(len(mons), len(abans) + 1)
        self.assertEqual(mons[-1], nou)
        self.assertEqual(nou["mon"], str(len(abans) + 1))
        max_xat = max(p[0] for m in abans for p in m["xat"])
        self.assertEqual([p[0] for p in nou["xat"]], [max_xat + 1, max_xat + 2, max_xat + 3])
        self.assertEqual([p[1] for p in nou["xat"]], ["el magma", "la lava", "el cràter"])
        self.assertEqual(nou["colors"], ["#1c1917", "#dc2626", "#fb923c"])
        dades = (self.tmp / "dades" / "volcans.js").read_text()
        self.assertIn('id:"volcans"', dades)
        self.assertIn("const T=[", dades)
        self.assertIn("const OB=[", dades)

    def test_no_crea_dues_vegades(self):
        nou_mon.crea(ARGS, self.tmp)
        with self.assertRaises(SystemExit) as e:
            nou_mon.crea(ARGS, self.tmp)
        self.assertIn("ja existeix", str(e.exception))

    def test_rebutja_id_mal_format(self):
        with self.assertRaises(SystemExit) as e:
            nou_mon.crea([("Volcans Nous!" if a == "volcans" else a) for a in ARGS], self.tmp)
        self.assertIn("id", str(e.exception))

    def carpeta(self, valor):
        return [(valor if a == "bio-i-geo/volcans" else a) for a in ARGS]

    def test_rebutja_carpetes_reservades_o_estranyes(self):
        for c in ("admin", "admin/volcans", "perfil/x", "motor/volcans", "../fora", "bio-i-geo/../admin", "Bio/Volcans"):
            with self.assertRaises(SystemExit, msg=c) as e:
                nou_mon.crea(self.carpeta(c), self.tmp)
            self.assertIn("carpeta", str(e.exception), c)

    def test_rebutja_una_carpeta_que_ja_existeix_al_disc(self):
        arrel = self.tmp / "arrel"
        (arrel / "bio-i-geo" / "volcans").mkdir(parents=True)
        with self.assertRaises(SystemExit) as e:
            nou_mon.crea(ARGS, self.tmp, arrel)
        self.assertIn("ja existeix", str(e.exception))

    def test_numero_de_mon_es_el_maxim_mes_u(self):
        mons = json.loads((self.tmp / "mons.json").read_text())
        mons[-1]["mon"] = "20"
        (self.tmp / "mons.json").write_text(json.dumps(mons, ensure_ascii=False, indent=1) + "\n")
        self.assertEqual(nou_mon.crea(ARGS, self.tmp)["mon"], "21")

    def test_rebutja_xat_sense_tres_peces(self):
        with self.assertRaises(SystemExit) as e:
            nou_mon.crea([("el magma|la lava" if a.startswith("el magma") else a) for a in ARGS], self.tmp)
        self.assertIn("3 peces", str(e.exception))


if __name__ == "__main__":
    unittest.main()
