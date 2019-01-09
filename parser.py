from pathlib import Path

import requests

OUTPUT_DIR = './catalog'
BASE_URL = 'https://ucampus.uchile.cl/m/fcfm_catalogo/'
DEPTS = {
    12060003: 'AA - Área para el Aprendizaje de la Ingeniería y Ciencias A2IC',
    3       : 'AS - Departamento de Astronomía',
    5       : 'CC - Departamento de Ciencias de la Computación',
    6       : 'CI - Departamento de Ingeniería Civil',
    306     : 'CM - Departamento de Ciencia de los Materiales',
    7       : 'DR - Área de Deportes, Recreación y Cultura',
    305     : 'ED - Doctorado en Ingeniería Eléctrica',
    8       : 'EH - Área de Estudios Humanísticos',
    9       : 'EI - Área de Idiomas, Escuela de Ingeniería',
    12060002: 'EI - Área de Ingeniería e Innovación',
    27      : 'EI - Escuela de Ingeniería',
    10      : 'EL - Departamento de Ingeniería Eléctrica',
    303     : 'EP - Escuela de Postgrado',
    12      : 'ES - Escuela de Ingeniería y Ciencias',
    310     : 'FG - Plataforma',
    13      : 'FI - Departamento de Física',
    15      : 'GF - Departamento de Geofísica',
    16      : 'GL - Departamento de Geología',
    19      : 'IN - Departamento de Ingeniería Industrial',
    21      : 'MA - Departamento de Ingeniería Matemática',
    22      : 'ME - Departamento de Ingeniería Mecánica',
    23      : 'MI - Departamento de Ingeniería de Minas',
    24      : 'MT - Doctorado en Ciencia de los Materiales',
    307     : 'QB - Departamento de Ingeniería Química y Biotecnología'
}


def fetch_html():
    for dept_id, dept_name in DEPTS.items():
        for year in range(2011, 2019):
            for sem in (1, 2):
                params = {'semestre': year * 10 + sem, 'depto': dept_id}
                resp = requests.get(BASE_URL, params=params)

                outdir = f'{OUTPUT_DIR}/{year}/{sem}'
                Path(outdir).mkdir(parents=True, exist_ok=True)

                with open(f'{outdir}/{dept_id}.html', 'w') as output:
                    output.write(resp.text)

if __name__ == '__main__':
    fetch_html()
