import math

def MMS(S, mean_service, mean_interarrival):
    lamb=1/mean_interarrival
    meu =1/ mean_service

    if(S==1):
        # Calculating metrics
        rho = lamb / meu
        if rho>=1:
            raise(Exception("Cannot be greater than 1"))
        number_in_queue = rho ** 2 / (1 - rho)
        wait_in_queue = number_in_queue / lamb
        wait_in_system = wait_in_queue + (1 / meu)
        number_in_system = wait_in_system * lamb
        proportion = 1 - rho
    else:
        
        rho = lamb / (S * meu)
        if rho>=1:
            raise(Exception("Cannot be greater than 1"))
         # Corrected calculation for P0
        P0_inv = sum(((S * rho) ** k) / math.factorial(k) for k in range(S-1)) + ((S * rho) ** S) / (math.factorial(S) * (1 - rho))
        P0 = 1 / P0_inv
        print(f"Probability of having zero customers in the system (P0) = {P0:.4f}")
        
        number_in_queue =P0*rho*((lamb/meu)** S) / math.factorial(S)*((1 - rho)**2)
        wait_in_queue = number_in_queue / lamb
        wait_in_system = wait_in_queue + (1 / meu)
        number_in_system = wait_in_system * lamb
        proportion = 1 - rho

    # Printing results with formatted strings
    print(f"Number in queue = {number_in_queue}")
    print(f"Wait in queue = {wait_in_queue}")
    print(f"Wait in system = {wait_in_system}")
    print(f"Number in system = {number_in_system}")
    print(f"Proportion of time server is idle = {proportion}")

    

# Input
S = int(input("Enter number of servers: "))
mean_interarrival = float(input("Enter mean inetr arrival: "))
mean_service = float(input("Enter mean service time: "))

MMS(S, mean_service, mean_interarrival)
