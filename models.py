from typing import List


class Course:
    def __init__(self, id: str, name: str, credits: int,
                 depends: List[str], equivs: List[str]):
        self.id = id
        self.name = name
        self.credits = credits
        self.depends = depends
        self.equivs = equivs


