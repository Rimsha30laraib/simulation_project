def generate_priority():
    no_of_priority=int(input("Enter no of priority: "))
    A=int(input("Enter A: "))
    C=int(input("Enter C: "))
    M=int(input("Enter M: "))
    Z=int(input("Enter Z: "))
    a=int(input("Enter a: "))
    b=int(input("Enter b: "))
    i=1
    print("S#","|","Z","|","LCG","|","RND","|","Priority")
    while(i<=no_of_priority):
        LCG=((A*Z)+C)%M
        Random_Number=LCG/M
        Y=(b-a)*Random_Number+a
        Priority=round(Y)
        
        print(i,"|",Z,"|",LCG,"|",Random_Number,"|",Priority)
        Z=LCG
        i=i+1

generate_priority()