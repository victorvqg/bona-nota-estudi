"""Prova de motor/registres.py (sense tocar el repo).

Ús: python3 motor/prova_registres.py
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import registres  # noqa: E402

SPRITES = 'const BN_SPR={\n fox:{w:16,h:16,p:[]},\n volca:{w:16,h:16,p:[]},\n};\nconst BN_SKILLS={\n cronos:{w:16,h:16,p:[]},\n};\n'
INDEX = 'const XAT_PC_BASE=[\n {id:1,s:"P",t:"el teu lloc",n:1},\n {id:43,s:"E",t:"la motxilla",n:1}];\n'


def mon(**canvis):
    m = {"dades": "prova", "carpeta": "x/prova", "materia": "M", "colors": ["#111111", "#dc2626", "#ffffff"],
         "curt": "Prova", "spr": "volca", "xat": [[70, "u"], [71, "dos"], [72, "tres"]]}
    m.update(canvis)
    return m


class ProvaRegistres(unittest.TestCase):
    def falla(self, mons, text):
        with self.assertRaises(SystemExit) as e:
            registres.valida(mons, SPRITES, registres.ids_xat_base(INDEX))
        self.assertIn(text, str(e.exception))

    def test_un_mon_be_passa(self):
        registres.valida([mon()], SPRITES, registres.ids_xat_base(INDEX))

    def test_ids_de_les_peces_generals(self):
        self.assertEqual(registres.ids_xat_base(INDEX), {1, 43})

    def test_peca_de_mon_amb_l_id_d_una_peca_general(self):
        self.falla([mon(xat=[[43, "u"], [71, "dos"], [72, "tres"]])], "general")

    def test_sprite_que_nomes_es_a_bn_skills(self):
        self.falla([mon(spr="cronos")], "BN_SPR")

    def test_color_mal_format(self):
        self.falla([mon(colors=["#111111", "#abc", "#ffffff"])], "color")

    def test_col_admin_mal_format(self):
        self.falla([mon(col_admin=["#111111"] * 7 + ["vermell"])], "col_admin")

    def test_text_amb_html(self):
        self.falla([mon(xat=[[70, "u</script>"], [71, "dos"], [72, "tres"]])], "<")

    def test_js_no_pot_tancar_un_script(self):
        self.assertNotIn("</", registres.js("a</script>b"))

    def test_bn_mon_del_mes_nou_al_mes_vell(self):
        b = registres.bloc_bn_mon([mon(dades="vell"), mon(dades="nou")])
        self.assertLess(b.index('"nou"'), b.index('"vell"'))


if __name__ == "__main__":
    unittest.main()
