command = ""
while command != "quit":
    command = input("> ").lower()
    if command == "start":
        print("Car Started")
    elif command == "stop":
        print("Car Stopped") 
    elif command == "help":
        print("""
            start - to start car 
            stop - to stop car
            quit-to quit the game
            """)
    else:
        print("Thanks for playing!!")   
