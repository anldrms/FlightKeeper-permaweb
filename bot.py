from arweave import Transaction, Wallet

print("Please enter path to your wallet")
fl_wa = input()

print("Please enter your flight number")
fl_n = input()

print("Please enter your departure airport")
fl_w = input()

print("Please enter your destination airport")
fl_t = input()

wallet = Wallet(fl_wa)

transaction = Transaction(wallet, data="FlightKeeper")
transaction.add_tag("Flight Number", fl_n)
transaction.add_tag("Departure", fl_w)
transaction.add_tag("Destination", fl_t)
transaction.sign()
transaction.send()
