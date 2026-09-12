w=int(input("What is your weight ? - "))
u=input ("(l)bs or (k)g")
if u.upper()=="L":
    z=w*0.45
    print(f"you are {z} kgs") 
else :
    p=w/0.45
    print(f"you are {p} pounds")
