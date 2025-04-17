a = {'F':['B','G'], 'B':['A','D'], 'A':['',''], 'D':['C','E'], 'C':['',''], 'E':['',''], 'G':['','I'], 'I':['','H'], 'H':['','']}

def taille(tab, letter):
    if tab[letter][0] == '' and tab[letter][1] == '':
        return 1
    else:
        sag = 0
        sad = 0 
        if tab[letter][0] != '':
            sag = taille(tab, tab[letter][0]) 
        if tab[letter][1] != '':
            sad = taille(tab , tab[letter][1])
        return 1 + sag + sad

    



print(taille(a, 'B'))

def echange(tab, i, j):
    temp = tab[i]
    tab[i] = tab[j]
    tab[j] = temp


def tri_selection(tab): 
    N = len(tab)
    for K in range(N): 
        imin = K
        for i in range(K, N):
            if tab[i] < tab[imin]:
                imin = i
            echange(tab, K, imin) 
    return tab
tab = [41, 55, 21, 18, 12, 6, 25]
tri_selection(tab)
print(tab)


information = 'informat*ion'

def correspond(org, potentialOrg):
    if len(org) != len(potentialOrg): 
        return False
    for i in range(len(org)): 
        if potentialOrg[i] != '*' and org[i] != potentialOrg[i]:
            print(org[i], potentialOrg[i])
            return False
    return True

print(correspond('information', '*nfo*mat*ons'))
print(correspond('AUTOMATIQUE', 'INFO*MA*IQUE'))
print(correspond('AUTO', '*UT*'))

plan_b = {'A':'C', 'B':'F', 'C':'E', 'D':'A', 'E':'B', 'F':'D'}
plan_a = {'A':'E', 'B':'F', 'C':'D', 'D':'C', 'E':'B', 'F':'A'}

def est_cyclique(plan):
    '''Prend en paramètre un dictionnaire `plan` correspondant à
    un plan d'envoi de messages (ici entre les personnes A, B, C,
    D, E, F).
    Renvoie True si le plan d'envoi de messages est cyclique et
    False sinon.'''
    expediteur = 'A'
    destinataire = plan[expediteur]
    nb_destinataires = 1
    print(destinataire)
    while destinataire != expediteur:
        destinataire = plan[destinataire]
        nb_destinataires += 1
    return nb_destinataires == len(plan)


print(est_cyclique(plan_b))