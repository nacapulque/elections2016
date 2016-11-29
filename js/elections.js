$(document).ready (function () { 
	var getData = function (key) { 
		var r = [
			{"control_element": ".highlight", "element_remove_class": "highlight"},
			{"control_element": ".county_" + key, "element_add_class": "highlight"},
		];
		for (var i = 1; i < arguments.length; i++) {
			for (var k in arguments [i]) { 
				if (k.indexOf ("_q") === -1) { 
					if (typeof arguments [i] [k] === "string") { 
						r.push ({"control_element": ".label_" + k, "element_text": arguments [i][k]});
					}

					if (arguments [i] [k] && typeof arguments [i] [k] === "object" && arguments [i] [k].value) { 
						r.push ({"control_element": ".label_" + k, "element_text": arguments [i][k].value});
					}
				}
			}
		}
		return r;
	};
	var cnf = {
		prequantifiers: {
			bubbles: function () {
				var counties = new Nestify (this.data.election_data, ["geoid"], ["geoid", "trumpd", "clintonh", "votes"]).data;
				return  {
					scale: {
						x: d3.scaleSqrt ().domain (counties.extent (function (a) { return parseInt (a.values.trumpd.value); })),
						y: d3.scaleSqrt ().domain (counties.extent (function (a) { return parseInt (a.values.clintonh.value); }).reverse ()),
						d: d3.scaleSqrt ().domain (counties.extent (function (a) { 
							var c = parseInt (a.values.clintonh.value ? a.values.clintonh.value : 0);
							var t = parseInt (a.values.trumpd.value ? a.values.trumpd.value : 0);
							
							return (c < t) ? t - c : c - t;
						})).range ([5, 20]),
						t: d3.scaleLinear ().domain (counties.extent (function (a) { return parseInt (a.values.votes.value)})).range ([5, 20])
					},
					data: [ {"values": counties.items () } ]
				};
			},
			counties: function () { 
				var sel = document.getElementById ("control");
				var labels = document.getElementById ("labels");
				var lbls = ["first", "second", "third", "fourth", "fifth"];
				for (var c in this.data.data.columns) { 
					var tr = document.createElement ("TR"), td = document.createElement ("TD");
					tr.classList.add ("labelcont");
					tr.classList.add ("labelcont_" + this.data.data.columns [c].replace ("_q", ""))
					if (this.data.data.columns [c].indexOf ("_q") !== -1) {
						var x = document.createElement ("OPTGROUP");
						x.label = this.data.data.columns [c].replace ("_q", "");
						for (var i = 1; i <= 5; i++) {
							var opt = document.createElement ("OPTION");
							opt.text = lbls [i-1] + " quintile";  
							var qt = this.data.data.columns [c].replace ("_q", ""); 
							$(opt).attr ({
								"data-control_element": ".county." + qt + "_" + i + ", .labelcont_" + qt,
								"data-element_add_class": "display",
							})
							x.appendChild (opt);
						}

						sel.appendChild (x);
					} else { 
						tr.appendChild (document.createElement ("TH")).appendChild (document.createTextNode (this.data.data.columns [c].replace (/_/g, " ")));
						td.classList.add ("label_" + this.data.data.columns [c].replace ("_q", ""))
					}
					tr.appendChild (td);
					labels.appendChild (tr);

					
				}
				this.data.election_data = [];
				this.data.election_data_by_county = {};
				this.data.county_data = new Nestify (this.data.data, ["id2"], this.data.data.columns).data;

				return this.data.county_data;
			}
		},
		quantifiers: {
			maps: {
				counties: function (a, args, data) {
					this.data.election_data_by_county [a.properties.geoid] = a.properties;
					this.data.election_data.push (a.properties);
					if (data [a.properties.geoid]) { 
						var cls = "county " + a.properties.winner + " county_" + a.properties.geoid; 
						for (var k in data [a.properties.geoid]) { 
							if (k.indexOf ("_q") !== -1) { 
								cls += " " + k.replace ("_q", "") + "_" + data [a.properties.geoid] [k].value;
							}
						}
						var data = {
							"parse": getData (a.properties.geoid, a.properties, this.data.county_data [a.properties.geoid])
						}; 
						return {"class": cls, "data": data};
					}
				}
			},
			lines: {
				bubbles: function (a, d, line, collection) { 
					var clintonh = parseInt (a.values.clintonh.value ? a.values.clintonh.value : 0), 
						trumpd = parseInt (a.values.trumpd.value ? a.values.trumpd.value : 0),
						diff = (clintonh > trumpd) ? clintonh - trumpd : trumpd - clintonh,
						winner = (clintonh < trumpd) ? "trumpd" : "clintonh",
						data = {
							"parse": getData (a.key, a.values, this.data.county_data [a.key]) 
						}; 
					var cls = "county " + winner + " county_" + a.key; 
					if (this.data.county_data [a.key]) { 
						for (var k in this.data.county_data [a.key]) { 
							if (k.indexOf ("_q") !== -1) { 
								cls += " " + k.replace ("_q", "") + "_" + this.data.county_data [a.key] [k].value;
							}
						}
					}
					return {
						"y": line.scale.y (clintonh), 
						"r": line.scale.t (parseInt (a.values.votes.value ? a.values.votes.value : 0)), 
						"x": line.scale.x (trumpd), 
						"class": cls,
						"data": data
					}
				}
			}
		}
	}
	new Ant (cnf);
});
