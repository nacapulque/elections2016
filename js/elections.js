$(document).ready (function () { 
	var cnf = {
		prequantifiers: {
			counties: function () { 
				var sel = document.getElementById ("control");
				var lbls = ["first", "second", "third", "fourth", "fifth"];
				for (var c in this.data.data.columns) { 
					if (this.data.data.columns [c].indexOf ("_q") !== -1) {
						var x = document.createElement ("OPTGROUP");
						x.label = this.data.data.columns [c].replace ("_q", "");
						for (var i = 1; i <= 5; i++) {
							var opt = document.createElement ("OPTION");
							opt.text = lbls [i-1] + " quintile";  
							$(opt).attr ({
								"data-control_element": "path.county." + this.data.data.columns [c].replace ("_q", "") + "_" + i,
								"data-element_add_class": "display"
							})
							x.appendChild (opt);
						}

						sel.appendChild (x);
					}
					
				}
				return new Nestify (this.data.data, ["id2"], this.data.data.columns).data;
			}
		},
		quantifiers: {
			maps: {
				counties: function (a, args, data) {
					if (data [a.properties.geoid]) { 
						var cls = "county " + a.properties.winner; 
						for (var k in data [a.properties.geoid]) { 
							if (k.indexOf ("_q") !== -1) { 
								cls += " " + k.replace ("_q", "") + "_" + data [a.properties.geoid] [k].value;
							}
						}
						return {"class": cls };
					}
				}
			}
		}
	}
	new Ant (cnf);
});
