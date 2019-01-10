from typing import List


class Course:
    def __init__(self, id: str, name: str, credits: int, dept: str,
                 depends: List[str], equivs: List[str]):
        self.id = id
        self.name = name
        self.dept = dept
        self.credits = credits
        self.depends = depends
        self.equivs = equivs
