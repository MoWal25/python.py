tasks = []

while True:
    choice = input("\n1.View  2.Add  3.Remove  4.Quit\nChoose: ")

    if choice == "1":
        print(tasks)

    elif choice == "2":
        tasks.append(input("Add task: "))

    elif choice == "3":
        tasks.remove(input("Remove task: "))

    elif choice == "4":
        break