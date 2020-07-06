async function arqlFlight() {
  const arweave = Arweave.init({
    host: "arweave.net", // Hostname or IP address for a Arweave host
    port: 443, // Port
    protocol: "https", // Network protocol http or https
    timeout: 20000,
    logging: false
  });

  const txids = await arweave.arql({
    op: "or",
    expr1: {
      op: "equals",
      expr1: "App-Name",
      expr2: "FlightKeeper"
    },
    expr2: {
      op: "equals",
      expr1: "App-Name",
      expr2: "AR-Flight"
    }
  });

  async function makeUL(array) {
    var flight_number = "Flight number not found";
    var flight_destination = "Flight destination airport not found";
    var flight_departure = "Flight departure airport not found";
    async function getTag(tx, tagName) {
      const arweave = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
        timeout: 20000,
        logging: false
      });
      const txid = await arweave.transactions.get(tx);
      const tags = txid.get("tags");
      for (let i = 0; i < tags.length; i++) {
        if (tags[i].get("name", { decode: true, string: true }) == tagName) {
          return tags[i].get("value", { decode: true, string: true });
        }
      }
    }
    for (var i = 0; i < array.length; i++) {
      arweave.transactions.get(array[i]).then(transaction => {
        (async () => {
          var address = await arweave.wallets.ownerToAddress(transaction.owner);
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
              if (getTag(transaction.id, "Flight-Number") == undefined) {
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
            }
          });
          var append_list_password = document.getElementById("feed");
          append_list_password.innerHTML += `<div class="ui card"><div class="content"><div class="event"><div class="summary"><a href="https://viewblock.io/arweave/address/${address}"><small>${address}</small></a> added new flight<br /><br /><div class="ui label">Flight Number</div> ${flight_number} <small>(<a href="https://www.airportia.com/flights/${flight_number}/">Airportia</a> or <a href="https://tr.flightaware.com/live/flight/${flight_number}">FlightAware</a>)</small><br /><br /><div class="ui label">Departure Airport</div> ${flight_departure}<br /><br /><div class="ui label">Destination Airport</div> ${flight_destination}</div></div></div></div>`;
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
