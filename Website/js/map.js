// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 2;
let searched = false;

let toggled = false;
let chartclosed = true;

let data = [
    //Classical
    {
        "name": "Classical",
        "data2019": "data/classical2019.csv",
        "data2020": "data/classical2020.csv",
    },
    //Country
    {
        "name": "Country",
        "data2019": "data/country2019.csv",
        "data2020": "data/country2020.csv",
    },
    //Electronic
    {
        "name": "Electronic",
        "data2019": "data/electronic2019.csv",
        "data2020": "data/electronic2020.csv",
    },
    //Indie
	{
        "name": "Indie",
        "data2019": "data/indie2019.csv",
        "data2020": "data/indie2020.csv",
    },
    //Pop
	{
        "name": "Pop",
        "data2019": "data/pop2019.csv",
        "data2020": "data/pop2020.csv",
    },
    //Rap
    {
        "name": "Rap",
        "data2019": "data/rap2019.csv",
        "data2020": "data/rap2020.csv",
    },
    //Rock
    {
        "name": "Rock",
        "data2019": "data/rock2019.csv",
        "data2020": "data/rock2020.csv",
    },
]

//marker global variables
let markers = [];
let showing = [];
let stateShows2019 = [];
let stateShows2020 = [];
let genreShows2019 = [];
let genreShows2020 = [];
let genrePopularity2019 = [];
let genrePopularity2020 = [];
let showsChart;
let popularityChart;
let cacheShows2019;
let cacheShows2020;
let cachePop2019;
let cachePop2020;
for (var i = 0; i < data.length; i++) {
    markers.push(null);
    showing.push(false);
    stateShows2019.push([]);
    stateShows2020.push([]);
    for(var j = 0; j < 52; j++) {
        stateShows2019[i].push(0);
        stateShows2020[i].push(0);
    }
    genreShows2019.push([]);
    genreShows2020.push([]);
    for(var j = 0; j < 12; j++) {
        genreShows2019[i].push(0);
        genreShows2020[i].push(0);
    }
    genrePopularity2019.push([]);
    genrePopularity2020.push([]);
    for(var j = 0; j < 12; j++) {
        genrePopularity2019[i].push(0);
        genrePopularity2020[i].push(0);
    }
}
var legend = L.control({position: 'bottomleft'});

//choropleth global variables
let choropleth = [false, false];
let values = [];
let valuesIndexed = [];
let geojsonPath = 'data/us-states.json';
let geojson_data;
let geojson_layer;
let brew = new classyBrew();
let info_panel = L.control();

// initialize
$( document ).ready(function() {
	sideBarItems(data);
    renderDashboard();
	createMap(lat,lon,zl);
});

document.getElementById('searchbox').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.code || e.key;
    if (keyCode == 'Enter'){
        this.blur();
        searchArtist();
        return false;
    }
}

var modal = document.getElementById("popup");

// Get the button that opens the modal
var btn = document.getElementById("infoBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

function sideBarItems(data) {
    data.forEach(function(item, index) {
        $(".sidebar-tags").append(`<div class="${showing[index] ? "sidebar-item-active" : "sidebar-item"}" id="${item.name}" onclick="loadAndMapData(${index});toggleGenreSidebarItem(${index});">${item.name}</div>`);
    });
    //$(".sidebar-tags").append(`<div class="sidebar-title">Artists</div>`);
}

function toggleChoroplethSidebarItem(index) {
    var choropleth2019 = document.getElementById("choropleth2019");
    var choropleth2020 = document.getElementById("choropleth2020");
    if(index == 0) {
        choropleth2019.classList.toggle("sidebar-item-active");
        choropleth[0] = !choropleth[0];
        if(choropleth[1]) {
            choropleth2020.classList.toggle("sidebar-item-active");
            choropleth[1] = false;
        }
    }
    else if(index == 1) {
        choropleth2020.classList.toggle("sidebar-item-active");
        choropleth[1] = !choropleth[1];
        if(choropleth[0]) {
            choropleth2019.classList.toggle("sidebar-item-active");
            choropleth[0] = false;
        }
    }
    if(!choropleth[0] && !choropleth[1] && geojson_layer!=undefined) {
        geojson_layer.removeLayer(info_panel);
        info_panel.remove();
        if (geojson_layer){
            geojson_layer.clearLayers()
        }
    }
    else {
        $.getJSON(geojsonPath, function(data) {
            geojson_data = data;
            if(choropleth[0]) {
                mapGeoJSON(2019);
            }
            else {
                mapGeoJSON(2020);
            }
        })
    }
}

function mapGeoJSON(year) {
    if (geojson_layer){
		geojson_layer.clearLayers()
	}
    fieldtomap = "density";
	// create an empty array
	values = [
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 
        0, 0, 0, 0, 0, 0, 0];

	// based on the provided field, enter each value into the array
	geojson_data.features.forEach(function(item, index){
        showCount = 0;
        for(var i = 0; i < showing.length; i++) {
            if(showing[i]) {
                showCount += (year == 2019 ? stateShows2019[i][index] : stateShows2020[i][index]);
            }
        }
		values[index] = showCount;
	})
    valuesIndexed = [];
    for(var i = 0; i < values.length; i++) {
        valuesIndexed.push(values[i]);
    }
	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(5);
	brew.setColorCode('YlOrRd');
	brew.classify('quantiles');

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data,{
		style: getStyle,
		onEachFeature: onEachFeature // actions on each feature
	}).addTo(map);
    createInfoPanel();
}

function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(valuesIndexed[feature.id]),
		fillOpacity: 0.8
	}
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
	});
}

// on mouse over, highlight the feature
function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}
    info_panel.update(layer.feature);
}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
    info_panel.update() // resets infopanel
}

function createInfoPanel(){

	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (feature) {
		// if feature is highlighted
		if(feature){
			this._div.innerHTML = `<b>${feature.properties.name}</b><br>Shows: ${valuesIndexed[feature.id]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a state';
		}
	};

	info_panel.addTo(map);
}

function toggleGenreSidebarItem(index) {
    var sidebarItem = document.getElementById(data[index].name);
    sidebarItem.classList.toggle("sidebar-item-active");
}

function loadAndMapData(index) {
    if(!markers[index]) {
        markers[index] = L.featureGroup();
        color1 = getRandomColor();
        color2 = getRandomColor();
        data[index].color2020 = color1;
        data[index].color2019 = color2;
        if(!data[index].skid) {
            Papa.parse(data[index].data2020, {
                header: true,
                download: true,
                complete: function(res) {
                    res.data.forEach(function(artist, i) {
                        songKick(index, `https://api.songkick.com/api/3.0/artists/${artist.skid}/gigography.json?apikey=Z2JWQTvgk4tsCdDn&min_date=2020-01-01&max_date=2020-12-31`, artist, color1, 2020, i+1, res.data.length);
                    })
                }
            });
            Papa.parse(data[index].data2019, {
                header: true,
                download: true,
                complete: function(res) {
                    res.data.forEach(function(artist) {
                        songKick(index, `https://api.songkick.com/api/3.0/artists/${artist.skid}/gigography.json?apikey=Z2JWQTvgk4tsCdDn&min_date=2019-01-01&max_date=2019-12-31`, artist, color2, 2019, i+1, res.data.length);
                    });
                }
            });
        }
        else {
            songKick(index, `https://api.songkick.com/api/3.0/artists/${data[index].skid}/gigography.json?apikey=Z2JWQTvgk4tsCdDn&min_date=2020-01-01&max_date=2020-12-31`, data[index], color1, 2020, 1, 1);
            songKick(index, `https://api.songkick.com/api/3.0/artists/${data[index].skid}/gigography.json?apikey=Z2JWQTvgk4tsCdDn&min_date=2019-01-01&max_date=2019-12-31`, data[index], color2, 2019, 1, 1);
        }
        markers[index].addTo(map);
        showing[index] = true;
        if(showing.every(v => v === false)) {
            document.getElementById('toggleChart').style.background = 'rgb(227, 222, 218)';
            document.getElementById('toggleChart').style.color = '#616161';
            document.getElementById('toggleChart').style.cursor = 'auto';
            chartclosed = true;
            document.getElementById("body").style.gridTemplateColumns = "20% 80%";
            document.getElementById("sidebar-tags").style.width = "100%";
            document.getElementById("sidebar-dashboard").style.width = "00%";
        }
        else if(chartclosed) {
            document.getElementById('toggleChart').style.background = 'rgb(245, 241, 237)';
            document.getElementById('toggleChart').style.color = 'black';
            document.getElementById('toggleChart').style.cursor = 'pointer';
        }
        renderLegend();
        return;
    }
    if(showing[index]) {
        map.removeLayer(markers[index]);
        showing[index] = false;
        renderDashboard();
    }
    else {
        markers[index].addTo(map);
        showing[index] = true;
        renderDashboard();
    }
    if(showing.every(v => v === false)) {
        document.getElementById('toggleChart').style.background = 'rgb(227 222 218)';
        document.getElementById('toggleChart').style.color = '#616161';
        document.getElementById('toggleChart').style.cursor = 'auto';
        chartclosed = true;
        document.getElementById("body").style.gridTemplateColumns = "20% 80%";
        document.getElementById("sidebar-tags").style.width = "100%";
        document.getElementById("sidebar-dashboard").style.width = "00%";
    }
    else if(chartclosed) {
        document.getElementById('toggleChart').style.background = 'rgb(245, 241, 237)';
        document.getElementById('toggleChart').style.color = 'black';
        document.getElementById('toggleChart').style.cursor = 'pointer';
    }
    renderLegend();
}

function renderLegend() {
    map.removeLayer(legend);
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend');
        if(showing.every(v => v === false)) {
            labels = ['']
        }
        else {
            labels = ['<strong style="font-family:Montserrat">Legend</strong>']
        }
        for (var i = 0; i < data.length; i++) {
            if(showing[i]) {
                div.innerHTML += 
                labels.push(
                    '<i class="circle" style="background:' + data[i].color2019 + '"></i> ' +
                    '<span style="font-family:Montserrat">' + data[i].name + " 2019</span>");
                div.innerHTML += 
                labels.push(
                    '<i class="circle" style="background:' + data[i].color2020 + '"></i> ' +
                    '<span style="font-family:Montserrat">' + data[i].name + " 2020</span>");
            }
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(map);
}

function renderDashboard(){
    var showsSeries = [];
    var popularitySeries = [];
    var colors = [];
    if(!cacheShows2019) {
        cacheShows2019 = [];
    }
    if(!cacheShows2020) {
        cacheShows2020 = [];
    }
    if(!cachePop2019) {
        cachePop2019 = [];
    }
    if(!cachePop2020) {
        cachePop2020 = [];
    }
    for(var i = 0; i < showing.length; i++) {
        if(showing[i]) {
            showsSeries.push({
                name: `${data[i].name} 2019`,
                data: genreShows2019[i],
            });
            showsSeries.push({
                name: `${data[i].name} 2020`,
                data: genreShows2020[i],
            });
            popularity2019 = [];
            popularity2020 = [];
            for(var j = 0; j < 12; j++) {
                if(genreShows2020[i][j] == 0) {
                    popularity2020.push(0);
                }
                else {
                    popularity2020.push(genrePopularity2020[i][j]/genreShows2020[i][j]);
                }
                if(genreShows2019[i][j] == 0) {
                    popularity2019.push(0);
                }
                else {
                    popularity2019.push(genrePopularity2019[i][j]/genreShows2019[i][j]);
                }
            }
            popularitySeries.push({
                name: `${data[i].name} 2019`,
                data: popularity2019,
            });
            popularitySeries.push({
                name: `${data[i].name} 2020`,
                data: popularity2020,
            });
            colors.push(data[i].color2019);
            colors.push(data[i].color2020);
        }
    }
    let showsOptions = {
        series: showsSeries,
        chart: {
            fontFamily: "Montserrat, sans-serif",
            height: '50%',
            type: 'line',
            zoom: {
                enabled: false,
            },
            animations: {
                enabled: false,
            },
            toolbar: {
                show: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Number of Shows by Month',
            align: 'center'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        colors: colors,
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        tooltip: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontFamily: "Montserrat, sans-serif",
            },
        },
    };
    let popularityOptions = {
        series: popularitySeries,
        chart: {
            fontFamily: "Montserrat, sans-serif",
            height: '50%',
            type: 'bar',
            zoom: {
                enabled: false,
            },
            animations: {
                enabled: false,
            },
            toolbar: {
                show: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Average Popularity of Shows by Month',
            align: 'center'
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        colors: colors,
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        yaxis: {
            decimalsInFloat: 3,
        },
        tooltip: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontFamily: "Montserrat, sans-serif",
            },
        },
        legend: {
            show: true,
        },
    };
    // create the charts
    if(showsChart) {
        showsChart.destroy();
    }
    if(popularityChart) {
        popularityChart.destroy();
    }
    showsChart = new ApexCharts(document.querySelector('#sidebar-chart-1'), showsOptions);
    popularityChart = new ApexCharts(document.querySelector('#sidebar-chart-2'), popularityOptions);
    showsChart.render();
    popularityChart.render();
}

function searchArtist(){
	const textBox = document.getElementById('searchbox');
	let query = textBox.value;
    //Check if null or whitespace or empty search query
    if(!query || query.length === 0 || /^\s*$/.test(query)) {
        textBox.value = "";
        return;
    }
	songKickArtistSearch(query);
}

function songKickArtistSearch(artist) {
    fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=Z2JWQTvgk4tsCdDn&query=${artist}`)
    .then((response) => {
        return response.json();
    })
    .then((myJson) => {
        let resultsPage = myJson.resultsPage;

        if(!resultsPage.totalEntries) {
            alert("No Artist Found!");
        }
        else {
            artistName = myJson.resultsPage.results.artist[0].displayName;
            artistId = myJson.resultsPage.results.artist[0].id;
            markers.push(null);
            showing.push(false);
            stateShows2019.push([
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0, 0]);
            stateShows2020.push([
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 
                0, 0, 0, 0, 0, 0, 0]);
            genreShows2019.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            genreShows2020.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            genrePopularity2019.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            genrePopularity2020.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            var details = {
                "grant_type": "client_credentials",
            };
            var formBody = [];
            for (var property in details) {
              var encodedKey = encodeURIComponent(property);
              var encodedValue = encodeURIComponent(details[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            fetch(`https://accounts.spotify.com/api/token`, {
                method: 'post',
                headers: {
                    "Authorization": "Basic YmQ0YjY3YzhlZDY5NGIzMmI2MzMwYjU2NGUzMTk2YmE6MzU1MzA2YzI0ZDVkNDgxNjhiMDYxODBiMTRkM2Q3N2Q",
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: formBody,
            })
            .then((response) => {
                return response.json();
            })
            .then((authResponse) => {
                fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist&limit=1`, {
                    headers: {
                        "Authorization": `Bearer ${authResponse.access_token}`,
                    },
                })
                .then((response) => {
                    return response.json();
                })
                .then((spotifyJson) => {
                    if(!searched) {
                        searched = true;
                        $(".sidebar-tags").append(`<div class="sidebar-title">Artists</div>`);
                    }
                    if(!spotifyJson.artists || !spotifyJson.artists.total) {
                        data.push({
                            "name": artistName,
                            "skid": artistId,
                        });
                        $(".sidebar-tags").append(`<div class="${showing[data.length-1] ? "sidebar-item-active" : "sidebar-item"}" id="${artistName}" onclick="loadAndMapData(${data.length-1});toggleGenreSidebarItem(${data.length-1});renderDashboard();">${artistName}</div>`);
                        return;
                    }
                    data.push({
                        "name": artistName,
                        "skid": artistId,
                        "spid": spotifyJson.artists.items[0].id,
                    });
                    $(".sidebar-tags").append(`<div class="${showing[data.length-1] ? "sidebar-item-active" : "sidebar-item"}" id="${artistName}" onclick="loadAndMapData(${data.length-1});toggleGenreSidebarItem(${data.length-1});renderDashboard();">${artistName}</div>`);
                });
            });
        }
    });
}

function songKick(index, url, artist, color, year, curr, max) {
	fetch(url)
	.then((response) => {
		return response.json();
	})
	.then((myJson) => {
		var count = 0;
		let resultsPage = myJson.resultsPage;
		if(resultsPage.totalEntries) {
			myJson.resultsPage.results.event.forEach(function(event) {
				let markerOptions = {
					radius: event.popularity * 25,
					weight: 1,
					color: 'white',
					fillColor: color,
					fillOpacity: .75
				}
				if(event.location != null && event.location.lat != null) {
					let marker = L.circleMarker([event.location.lat, event.location.lng], markerOptions).on('mouseover',function()
					{
						this.bindPopup(`
                        <span class="circle" style="background:${color}"></span><span class="popup-title">   ${event.displayName}</span><br>
                        <span>Artist: ${artist.spid ? `<a href="https://open.spotify.com/artist/${artist.spid}" target="_blank">${artist.name}</a>` : artist.name}</span><br>
                        <span>${event.start.time ? `Date & Time: ${event.start.date} at ${event.start.time}` : `Date: ${event.start.date}`}</span><br>
                        <span>Venue: ${event.venue.displayName}, ${event.location.city}</span><br>
                        <div>Popularity:</div>
                        <div class="progress-bar">
                            <div class="progress-bar-container" style="width:${(200-57)*event.popularity}px;background-color:${color}"></div>
                        </div>`, {minWidth: 300}).openPopup();
					});
					markers[index].addLayer(marker);
				}
                //If show in US
                if(event.venue && event.venue.metroArea && event.venue.metroArea.country.displayName == "US") {
                    incrementStateShows(index, year, event.venue.metroArea.state.displayName);
                }
                if(event.start && event.start.date && event.popularity) {
                    incrementGenreShows(index, year, event.start.date.substring(5, 7), event.popularity);
                }
				count += 1;
			});
			if((myJson.resultsPage.page-1) * 50 + count < myJson.resultsPage.totalEntries) {
				songKick(index, url+`&page=${myJson.resultsPage.page + 1}`, artist, color, year, curr, max);
			}
            //toggleChoroplethSidebarItem(2);
		}
	})
    .then(() => {
        if(curr == max) {
            renderDashboard();
            setTimeout(renderDashboard, 1000);
            setTimeout(renderDashboard, 3000);
            setTimeout(renderDashboard, 6000);
        }
    })
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function toggleChart(){
    if(showing.every(v => v === false)) {
        return;
    }
    //var toggleChart = document.getElementById("toggleChart");
    //toggleChart.classList.toggle("sidebar-item-active");
    if(chartclosed){
        document.getElementById('toggleChart').style.background = 'rgb(190, 185, 180)';
        document.getElementById('toggleChart').style.color = 'black';
        document.getElementById("body").style.gridTemplateColumns = "50% 50%";
        document.getElementById("sidebar-tags").style.width = "30%";
        document.getElementById("sidebar-dashboard").style.width = "70%";
        renderDashboard();
        chartclosed = !chartclosed;
    }
    else{
        document.getElementById('toggleChart').style.background = 'rgb(245, 241, 237)';
        document.getElementById('toggleChart').style.color = 'black';
        document.getElementById("body").style.gridTemplateColumns = "20% 80%";
        document.getElementById("sidebar-tags").style.width = "100%";
        document.getElementById("sidebar-dashboard").style.width = "00%";
        chartclosed = !chartclosed;
    }
}

function incrementStateShows(index, year, state) {
    if(year == 2020) {
        switch(state) {
            case "AL":
                stateShows2020[index][0] += 1;
                break;
            case "AK":
                stateShows2020[index][1] += 1;
                break;
            case "AZ":
                stateShows2020[index][2] += 1;
                break;
            case "AR":
                stateShows2020[index][3] += 1;
                break;
            case "CA":
                stateShows2020[index][4] += 1;
                break;
            case "CO":
                stateShows2020[index][5] += 1;
                break;
            case "CT":
                stateShows2020[index][6] += 1;
                break;
            case "DE":
                stateShows2020[index][7] += 1;
                break;
            case "DC":
                stateShows2020[index][8] += 1;
                break;
            case "FL":
                stateShows2020[index][9] += 1;
                break;
            case "GA":
                stateShows2020[index][10] += 1;
                break;
            case "HI":
                stateShows2020[index][11] += 1;
                break;
            case "ID":
                stateShows2020[index][12] += 1;
                break;
            case "IL":
                stateShows2020[index][13] += 1;
                break;
            case "IN":
                stateShows2020[index][14] += 1;
                break;
            case "IA":
                stateShows2020[index][15] += 1;
                break;
            case "KS":
                stateShows2020[index][16] += 1;
                break;
            case "KY":
                stateShows2020[index][17] += 1;
                break;
            case "LA":
                stateShows2020[index][18] += 1;
                break;
            case "ME":
                stateShows2020[index][19] += 1;
                break;
            case "MD":
                stateShows2020[index][20] += 1;
                break;
            case "MA":
                stateShows2020[index][21] += 1;
                break;
            case "MI":
                stateShows2020[index][22] += 1;
                break;
            case "MN":
                stateShows2020[index][23] += 1;
                break;
            case "MS":
                stateShows2020[index][24] += 1;
                break;
            case "MO":
                stateShows2020[index][25] += 1;
                break;
            case "MT":
                stateShows2020[index][26] += 1;
                break;
            case "NE":
                stateShows2020[index][27] += 1;
                break;
            case "NV":
                stateShows2020[index][28] += 1;
                break;
            case "NH":
                stateShows2020[index][29] += 1;
                break;
            case "NJ":
                stateShows2020[index][30] += 1;
                break;
            case "NM":
                stateShows2020[index][31] += 1;
                break;
            case "NY":
                stateShows2020[index][32] += 1;
                break;
            case "NC":
                stateShows2020[index][33] += 1;
                break;
            case "ND":
                stateShows2020[index][34] += 1;
                break;
            case "OH":
                stateShows2020[index][35] += 1;
                break;
            case "OK":
                stateShows2020[index][36] += 1;
                break;
            case "OR":
                stateShows2020[index][37] += 1;
                break;
            case "PA":
                stateShows2020[index][38] += 1;
                break;
            case "RI":
                stateShows2020[index][39] += 1;
                break;
            case "SC":
                stateShows2020[index][40] += 1;
                break;
            case "SD":
                stateShows2020[index][41] += 1;
                break;
            case "TN":
                stateShows2020[index][42] += 1;
                break;
            case "TX":
                stateShows2020[index][43] += 1;
                break;
            case "UT":
                stateShows2020[index][44] += 1;
                break;
            case "VT":
                stateShows2020[index][45] += 1;
                break;
            case "VA":
                stateShows2020[index][46] += 1;
                break;
            case "WA":
                stateShows2020[index][47] += 1;
                break;
            case "WV":
                stateShows2020[index][48] += 1;
                break;
            case "WI":
                stateShows2020[index][49] += 1;
                break;
            case "WY":
                stateShows2020[index][50] += 1;
                break;
            case "PR":
                stateShows2020[index][51] += 1;
                break;
        }
    }
    else {
        switch(state) {
            case "AL":
                stateShows2019[index][0] += 1;
                break;
            case "AK":
                stateShows2019[index][1] += 1;
                break;
            case "AZ":
                stateShows2019[index][2] += 1;
                break;
            case "AR":
                stateShows2019[index][3] += 1;
                break;
            case "CA":
                stateShows2019[index][4] += 1;
                break;
            case "CO":
                stateShows2019[index][5] += 1;
                break;
            case "CT":
                stateShows2019[index][6] += 1;
                break;
            case "DE":
                stateShows2019[index][7] += 1;
                break;
            case "DC":
                stateShows2019[index][8] += 1;
                break;
            case "FL":
                stateShows2019[index][9] += 1;
                break;
            case "GA":
                stateShows2019[index][10] += 1;
                break;
            case "HI":
                stateShows2019[index][11] += 1;
                break;
            case "ID":
                stateShows2019[index][12] += 1;
                break;
            case "IL":
                stateShows2019[index][13] += 1;
                break;
            case "IN":
                stateShows2019[index][14] += 1;
                break;
            case "IA":
                stateShows2019[index][15] += 1;
                break;
            case "KS":
                stateShows2019[index][16] += 1;
                break;
            case "KY":
                stateShows2019[index][17] += 1;
                break;
            case "LA":
                stateShows2019[index][18] += 1;
                break;
            case "ME":
                stateShows2019[index][19] += 1;
                break;
            case "MD":
                stateShows2019[index][20] += 1;
                break;
            case "MA":
                stateShows2019[index][21] += 1;
                break;
            case "MI":
                stateShows2019[index][22] += 1;
                break;
            case "MN":
                stateShows2019[index][23] += 1;
                break;
            case "MS":
                stateShows2019[index][24] += 1;
                break;
            case "MO":
                stateShows2019[index][25] += 1;
                break;
            case "MT":
                stateShows2019[index][26] += 1;
                break;
            case "NE":
                stateShows2019[index][27] += 1;
                break;
            case "NV":
                stateShows2019[index][28] += 1;
                break;
            case "NH":
                stateShows2019[index][29] += 1;
                break;
            case "NJ":
                stateShows2019[index][30] += 1;
                break;
            case "NM":
                stateShows2019[index][31] += 1;
                break;
            case "NY":
                stateShows2019[index][32] += 1;
                break;
            case "NC":
                stateShows2019[index][33] += 1;
                break;
            case "ND":
                stateShows2019[index][34] += 1;
                break;
            case "OH":
                stateShows2019[index][35] += 1;
                break;
            case "OK":
                stateShows2019[index][36] += 1;
                break;
            case "OR":
                stateShows2019[index][37] += 1;
                break;
            case "PA":
                stateShows2019[index][38] += 1;
                break;
            case "RI":
                stateShows2019[index][39] += 1;
                break;
            case "SC":
                stateShows2019[index][40] += 1;
                break;
            case "SD":
                stateShows2019[index][41] += 1;
                break;
            case "TN":
                stateShows2019[index][42] += 1;
                break;
            case "TX":
                stateShows2019[index][43] += 1;
                break;
            case "UT":
                stateShows2019[index][44] += 1;
                break;
            case "VT":
                stateShows2019[index][45] += 1;
                break;
            case "VA":
                stateShows2019[index][46] += 1;
                break;
            case "WA":
                stateShows2019[index][47] += 1;
                break;
            case "WV":
                stateShows2019[index][48] += 1;
                break;
            case "WI":
                stateShows2019[index][49] += 1;
                break;
            case "WY":
                stateShows2019[index][50] += 1;
                break;
            case "PR":
                stateShows2019[index][51] += 1;
                break;
        }
    }
}

function incrementGenreShows(index, year, month, popularity) {
    if(year == 2020) {
        switch(month) {
            case "01":
                genreShows2020[index][0] += 1;
                genrePopularity2020[index][0] += popularity;
                break;
            case "02":
                genreShows2020[index][1] += 1;
                genrePopularity2020[index][1] += popularity;
                break;
            case "03":
                genreShows2020[index][2] += 1;
                genrePopularity2020[index][2] += popularity;
                break;
            case "04":
                genreShows2020[index][3] += 1;
                genrePopularity2020[index][3] += popularity;
                break;
            case "05":
                genreShows2020[index][4] += 1;
                genrePopularity2020[index][4] += popularity;
                break;
            case "06":
                genreShows2020[index][5] += 1;
                genrePopularity2020[index][5] += popularity;
                break;
            case "07":
                genreShows2020[index][6] += 1;
                genrePopularity2020[index][6] += popularity;
                break;
            case "08":
                genreShows2020[index][7] += 1;
                genrePopularity2020[index][7] += popularity;
                break;
            case "09":
                genreShows2020[index][8] += 1;
                genrePopularity2020[index][8] += popularity;
                break;
            case "10":
                genreShows2020[index][9] += 1;
                genrePopularity2020[index][9] += popularity;
                break;
            case "11":
                genreShows2020[index][10] += 1;
                genrePopularity2020[index][10] += popularity;
                break;
            case "12":
                genreShows2020[index][11] += 1;
                genrePopularity2020[index][11] += popularity;
                break;
        }
    }
    else {
        switch(month) {
            case "01":
                genreShows2019[index][0] += 1;
                genrePopularity2019[index][0] += popularity;
                break;
            case "02":
                genreShows2019[index][1] += 1;
                genrePopularity2019[index][1] += popularity;
                break;
            case "03":
                genreShows2019[index][2] += 1;
                genrePopularity2019[index][2] += popularity;
                break;
            case "04":
                genreShows2019[index][3] += 1;
                genrePopularity2019[index][3] += popularity;
                break;
            case "05":
                genreShows2019[index][4] += 1;
                genrePopularity2019[index][4] += popularity;
                break;
            case "06":
                genreShows2019[index][5] += 1;
                genrePopularity2019[index][5] += popularity;
                break;
            case "07":
                genreShows2019[index][6] += 1;
                genrePopularity2019[index][6] += popularity;
                break;
            case "08":
                genreShows2019[index][7] += 1;
                genrePopularity2019[index][7] += popularity;
                break;
            case "09":
                genreShows2019[index][8] += 1;
                genrePopularity2019[index][8] += popularity;
                break;
            case "10":
                genreShows2019[index][9] += 1;
                genrePopularity2019[index][9] += popularity;
                break;
            case "11":
                genreShows2019[index][10] += 1;
                genrePopularity2019[index][10] += popularity;
                break;
            case "12":
                genreShows2019[index][11] += 1;
                genrePopularity2019[index][11] += popularity;
                break;
        }
    }
}