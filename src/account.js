document
  .getElementById("arweave-keyfile")
  .addEventListener("change", function() {
    var fr = new FileReader();
    fr.onload = function() {
      document.getElementById("output").value = fr.result;
    };

    fr.readAsText(this.files[0]);
  });

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}


var address;

async function getWalletAddress() {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000,
    logging: false
  });
  var wallet_file = await JSON.parse(document.getElementById("output").value);
  arweave.wallets.jwkToAddress(wallet_file).then(my_address => {
    document.getElementById("walletAddress").innerHTML = my_address;
  });
}

function login() {
  var ui = document.getElementById("account_dashboard");
  if (ui.style.display === "none") {
    ui.style.display = "block";
    hideAccount();
  } else {
    ui.style.display = "none";
    hideAccount();
  }
  getWalletAddress();
  async function arqlFlight() {
    const arweave = Arweave.init({
      host: "arweave.net", // Hostname or IP address for a Arweave host
      port: 443, // Port
      protocol: "https", // Network protocol http or https
      timeout: 20000,
      logging: false
    });
    var wallet_file = await JSON.parse(document.getElementById("output").value);
    await arweave.wallets.jwkToAddress(wallet_file).then(my_address => {
      address = my_address
    });
    const txids = await arweave.arql({
      op: "and",
      expr1: {
        op: "equals",
        expr1: "from",
        expr2: address
      },
      expr2: {
        op: "equals",
        expr1: "App-Name",
        expr2: "FlightKeeper"
      }
    });

    async function makeUL(array) {
      var flight_number = "Flight number not found";
      var flight_destination = "Flight destination airport not found";
      var flight_departure = "Flight departure airport not found";
      for (var i = 0; i < array.length; i++) {
        arweave.transactions.get(array[i]).then(transaction => {
          (async () => {
            var address = await arweave.wallets.ownerToAddress(
              transaction.owner
            );
            transaction.get("tags").forEach(tag => {
              let key = tag.get("name", {
                decode: true,
                string: true
              });
              let value = tag.get("value", {
                decode: true,
                string: true
              });
              if (key == "Flight-Number") {
                if (value == "") {
                  flight_number = "Flight number not found";
                } else {
                  flight_number = value;
                }
              }
              if (key == "Departure-Airport") {
                flight_departure = value;
              }
              if (key == "Destination-Airport") {
                flight_destination = value;
              } else {
                //Nothing
              }
            });
            var append_list_password = document.getElementById("feed");
            append_list_password.innerHTML += `<div class="ui card"><div class="content"><div class="event"><div class="summary">You added added new flight<br /><br /><div class="ui label">Flight Number</div> ${flight_number} <small>(<a href="https://www.airportia.com/flights/${flight_number}/">Airportia</a> or <a href="https://tr.flightaware.com/live/flight/${flight_number}">FlightAware</a>)</small><br /><br /><div class="ui label">Departure Airport</div> ${flight_departure}<br /><br /><div class="ui label">Destination Airport</div> ${flight_destination}</div></div></div></div>`;
            var flight_number = "Flight number not found";
            var flight_destination = "Flight destination airport not found";
            var flight_departure = "Flight departure airport not found";
          })();
        });
      }
    }
    makeUL(txids);
  }

  arqlFlight();
}

function hideAccount() {
  var account_home = document.getElementById("account_home");
  if (account_home.style.display === "none") {
    account_home.style.display = "block";
  } else {
    account_home.style.display = "none";
  }
}

async function uploadFlightDetails() {
  const arweave = Arweave.init({
    host: "arweave.net", // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: "https", // Network protocol http or https
    timeout: 20000,
    logging: false
  });
  let key = await JSON.parse(document.getElementById("output").value);
  var flight_number = document.getElementById("flight_number").value;
  var departure_airport = document.getElementById("departure_airport").value;
  var destination_airport = document.getElementById("destination_airport")
    .value;
  var comments = document.getElementById("comments").value;
  let transaction = await arweave.createTransaction(
    {
      data: "FlightKeeper"
    },
    key
  );
  transaction.addTag("App-Name", "FlightKeeper");
  transaction.addTag("Flight-Number", flight_number);
  transaction.addTag("Departure-Airport", departure_airport);
  transaction.addTag("Destination-Airport", destination_airport);
  if ((comments = "")) {
    //Nothing
  } else {
    transaction.addTag("Comments", comments);
  }
  await arweave.transactions.sign(transaction, key);
  var txid = transaction.id;
  const response = await arweave.transactions.post(transaction);
  alert("Flight details uploaded with TXID: " + txid);
}
