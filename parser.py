from pathlib import Path
from bs4 import BeautifulSoup
from html.parser import HTMLParser
import re

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


class CourseParser(HTMLParser):
    def error(self, message):
        pass

    def handle_starttag(self, tag, attrs):
        if tag.lower() == 'div' and dict(attrs).get('class', None) == 'ramo':
            print('ramo :)')


def fetch_html():
    for dept_id, dept_name in DEPTS.items():
        for year in range(2013, 2019):
            for sem in (1, 2):
                params = {'semestre': year * 10 + sem, 'depto': dept_id}
                resp = requests.get(BASE_URL, params=params)

                outdir = f'{OUTPUT_DIR}/{year}/{sem}'
                Path(outdir).mkdir(parents=True, exist_ok=True)

                with open(f'{outdir}/{dept_id}.html', 'w') as output:
                    output.write(resp.text)


def course_str_to_list(course_list):
    # split up into list
    lst = re.sub('[^0-9a-zA-Z]+', ' ', course_list).strip().split()
    # remove AUTOR, 'No tiene'
    return list(filter(
        lambda x: x != 'AUTOR' and x != 'No' and x != 'tiene',
        lst))


if __name__ == '__main__':
    # fetch_html()
    with open('./catalog/2017/2/5.html', 'r') as html_file:
        soup = BeautifulSoup(html_file, 'html5lib')
        ramos = soup.find_all(
            lambda tag: tag.has_attr('class') and 'ramo' in tag['class']
        )

        # print(ramos)
        for ramo in ramos:
            r_id = ramo.h2['id']
            r_name = next(ramo.h2.stripped_strings)

            dl = ramo.find('dl')
            uds = 0
            reqs = []
            eqs = []

            dts = dl.find_all('dt')
            dds = dl.find_all('dd')

            for dt, dd in zip(dts, dds):
                if dt.string == 'Créditos':
                    uds = int(dd.string)
                elif dt.string == 'Requisitos':
                    reqs = dd.string
                elif dt.string == 'Equivalencias':
                    eqs = dd.string

            if reqs:
                reqs = course_str_to_list(reqs)
            if eqs:
                eqs = course_str_to_list(eqs)

            print(r_id, r_name, uds, reqs, eqs)
