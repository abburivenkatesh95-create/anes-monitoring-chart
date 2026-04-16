const DRUG_LIBRARY = {
  Acepromazine: { concentration: 10, route: "IM", canine: { low: 0.01, high: 0.05 }, feline: { low: 0.01, high: 0.05 }, other: { low: 0.01, high: 0.05 }, notes: "Phenothiazine tranquilizer" },
  Alfaxalone: { concentration: 10, route: "IV", canine: { low: 1.5, high: 3 }, feline: { low: 1, high: 3 }, other: { low: 1, high: 3 }, notes: "Induction dose to effect" },
  Atropine: { concentration: 0.54, route: "IV", canine: { low: 0.02, high: 0.04 }, feline: { low: 0.02, high: 0.04 }, other: { low: 0.02, high: 0.04 }, notes: "Anticholinergic" },
  Buprenorphine: { concentration: 0.3, route: "IV", canine: { low: 0.01, high: 0.02 }, feline: { low: 0.01, high: 0.03 }, other: { low: 0.01, high: 0.02 }, notes: "Partial mu opioid" },
  Butorphanol: { concentration: 10, route: "IV", canine: { low: 0.1, high: 0.4 }, feline: { low: 0.1, high: 0.4 }, other: { low: 0.1, high: 0.4 }, notes: "Kappa agonist / mu antagonist" },
  Dexmedetomidine: { concentration: 0.5, route: "IM", canine: { low: 0.001, high: 0.01 }, feline: { low: 0.002, high: 0.01 }, other: { low: 0.001, high: 0.01 }, notes: "Alpha-2 agonist" },
  Diazepam: { concentration: 5, route: "IV", canine: { low: 0.2, high: 0.5 }, feline: { low: 0.2, high: 0.5 }, other: { low: 0.2, high: 0.5 }, notes: "Benzodiazepine" },
  Glycopyrrolate: { concentration: 0.2, route: "IV", canine: { low: 0.005, high: 0.01 }, feline: { low: 0.005, high: 0.01 }, other: { low: 0.005, high: 0.01 }, notes: "Anticholinergic" },
  Hydromorphone: { concentration: 2, route: "IV", canine: { low: 0.05, high: 0.2 }, feline: { low: 0.025, high: 0.1 }, other: { low: 0.025, high: 0.1 }, notes: "Full mu opioid" },
  Ketamine: { concentration: 100, route: "IV", canine: { low: 1, high: 5 }, feline: { low: 1, high: 5 }, other: { low: 1, high: 5 }, notes: "Dissociative anesthetic" },
  Lidocaine: { concentration: 20, route: "IV", canine: { low: 1, high: 2 }, feline: { low: 0.1, high: 0.5 }, other: { low: 0.1, high: 1 }, notes: "Local anesthetic / antiarrhythmic" },
  Maropitant: { concentration: 10, route: "SC", canine: { low: 1, high: 1 }, feline: { low: 1, high: 1 }, other: { low: 1, high: 1 }, notes: "Antiemetic" },
  Methadone: { concentration: 10, route: "IV", canine: { low: 0.1, high: 0.3 }, feline: { low: 0.1, high: 0.3 }, other: { low: 0.1, high: 0.3 }, notes: "Full mu opioid" },
  Midazolam: { concentration: 5, route: "IV", canine: { low: 0.1, high: 0.3 }, feline: { low: 0.1, high: 0.3 }, other: { low: 0.1, high: 0.3 }, notes: "Benzodiazepine" },
  Propofol: { concentration: 10, route: "IV", canine: { low: 2, high: 6 }, feline: { low: 2, high: 8 }, other: { low: 2, high: 6 }, notes: "Induction dose to effect" }
};
