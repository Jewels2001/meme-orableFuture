<template>
    <div class="map-container">
        <div id="map" class="map"></div>
        <div id="info">&nbsp;</div>
    </div>
    <div class="country-info">
        <div id="country-name">&nbsp;</div>
        <div id="arrow-down"></div>
    </div>
    <div class="legend">
        <div class="bar">
            <span class="middle-line"></span>
        </div>
        <div class="numbers">
            <p>0%</p>
            <p>25%</p>
            <p>50%</p>
            <p>75%</p>
            <p>100%</p>
        </div>
    </div>

    <CountryInfo v-if="showCountryInfo" :countryName="this.countryName" />
</template>
  
<style>
@font-face {
    font-family: 'Nunito-Regular';
    font-weight: 400;
    src: local('Nunito-Regular'), url(../fonts/Nunito-Regular.ttf) format('truetype');
}

.map-container {
    position: relative;
    height: 100vh;
}

.map {
    width: 100%;
    height: 100vh;
}

.country-info {
    width: 100%;
    height: 25px;
    position: absolute;
    z-index: 99;
    bottom: 10%;
    left: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.country-info {
    width: 100%;
    height: 25px;
    position: absolute;
    z-index: 99;
    bottom: 10%;
    left: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#country-name {
    color: transparent;
    background: linear-gradient(to bottom, #fff, #709775);
    background-clip: text;
    -webkit-background-clip: text;
    font-family: "Nunito-SemiBold";
    color: #8FB996;
    text-shadow: 2px 2px 4px #415D43;
    font-size: 80px;
}

#arrow-down {
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 20px solid #A1CCA5;
    margin-bottom: 3%;
    margin-left: -33%;
}

.legend {
    width: 100%;
    height: 25px;
    position: absolute;
    z-index: 99;
    bottom: 10px;
    left: 10px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.bar {
    width: 33%;
    height: 25%;
    min-height: 10px;
    background-image: linear-gradient(to right, #FF7A00, #02FFFF);
    position: relative;
    border-radius: 75px;
    opacity: 0.75;
}

.bar::before,
.bar::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #1a2b39;
}

.bar::before {
    left: 25%;
    /* first line */
}

.middle-line {
    content: "";
    position: absolute;
    height: 100%;
    width: 2px;
    background-color: #1a2b39;
    left: 50%;
}

.bar::after {
    left: 75%;
    /* third line */
}

.numbers {
    width: 33%;
    color: white;
    font-family: "Nunito-Regular";
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>

<script>
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import CountryInfo from './CountryInfo.vue';
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';

let countryName = "";

export default {
    name: 'MapContainer',
    components: { CountryInfo },
    props: {},
    data() {
        return {
            showCountryInfo: false,
            countryName: "",
        }
    },
    mounted() {
        const sustainableCountries = new VectorLayer({
            background: 'transparent',
            source: new VectorSource({
                url: "https://services7.arcgis.com/IyvyFk20mB7Wpc95/arcgis/rest/services/Sustainable_Development_Report_2023_(with_indicators)_/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson",
                format: new GeoJSON(),
            }),
            style: {
                'stroke-width': 0,
            }
        });


        const vectorLayer = new VectorLayer({
            background: 'transparent',
            source: new VectorSource({
                url: "https://new-data.greenglobe.pages.dev/data/countries.geojson",
                format: new GeoJSON(),
            }),
            style: function (feature) {
                const countryName = feature.get('ISO_A3');
                const sustainableFeature = sustainableCountries.getSource().getFeatures().find((feature) => {
                    return feature.get('ID') === countryName;
                });
                const defaultStyle = new Style({
                    stroke: new Stroke({
                        color: 'rgba(36, 40, 42, 0.7)',
                        width: 1,
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.7)',
                    }),
                });

                function interpolateColor(color1, color2, value) {
                    const r1 = parseInt(color1.slice(1, 3), 16);
                    const g1 = parseInt(color1.slice(3, 5), 16);
                    const b1 = parseInt(color1.slice(5, 7), 16);

                    const r2 = parseInt(color2.slice(1, 3), 16);
                    const g2 = parseInt(color2.slice(3, 5), 16);
                    const b2 = parseInt(color2.slice(5, 7), 16);

                    const r = Math.round(r1 + (r2 - r1) * value);
                    const g = Math.round(g1 + (g2 - g1) * value);
                    const b = Math.round(b1 + (b2 - b1) * value);

                    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

                    return hex;
                }


                if (sustainableFeature) {
                    const overallScore = sustainableFeature.get('Overall_Score');

                    // Normalize the overall score between 0 and 1
                    const normalizedValue = (overallScore - 58) / (87 - 58);
                    const color = interpolateColor('#FF7A00', '#02FFFF', normalizedValue);

                    return new Style({
                        stroke: defaultStyle.getStroke(),
                        fill: new Fill({
                            color: color,
                        }),
                    });
                }

                return defaultStyle;
            }
        });

        const map = new Map({
            layers: [vectorLayer, sustainableCountries],
            target: 'map',
            view: new View({
                center: [0, 0],
                zoom: 1,
            })
        });
        const featureOverlay = new VectorLayer({
            source: new VectorSource(),
            map: map,
            style: {
                'stroke-color': 'rgba(112, 151, 117, 0.7)',
                'fill-color': 'rgba(112, 151, 117, 0.7)',
                'stroke-width': 2,
            },
        });

        let highlight;
        const displayFeatureInfo = function (pixel) {
            const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });

            const info = document.getElementById('info');
            const country_name = document.getElementById('country-name');
            const sustain_arrow = document.getElementById('arrow-down');
            if (feature) {
                info.innerHTML = feature.get('ADMIN') || '&nbsp;';
                country_name.innerHTML = feature.get('ADMIN') || '&nbsp;';
                sustain_arrow.style.marginLeft = "0%";
            } else {
                info.innerHTML = '&nbsp;';
                country_name.innerHTML = '&nbsp;';
                sustain_arrow.style.marginLeft = "0%";
            }

            if (feature !== highlight) {
                if (highlight) {
                    featureOverlay.getSource().removeFeature(highlight);
                }
                if (feature) {
                    featureOverlay.getSource().addFeature(feature);
                }
                highlight = feature;
            }
        };
        map.on('pointermove', function (evt) {
            if (evt.dragging) {
                return;
            }
            const pixel = map.getEventPixel(evt.originalEvent);
            displayFeatureInfo(pixel);
        });

        map.on('click', function (evt) {
            displayFeatureInfo(evt.pixel);
            const sustain_arrow = document.getElementById('arrow-down');
            const sustain_value = Math.floor(Math.random() * (33 + 33 + 1)) - 33;
            var percent = `${sustain_value}%`
            sustain_arrow.style.marginLeft = percent;
            const pixel = map.getEventPixel(evt.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
                return feature;
            });
            var countryName = {};
            if(feature) {
                countryName.innerHTML = feature.get('ADMIN') || '&nbsp;';
                countryName = countryName.innerHTML;
            }

            console.log(countryName);
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            };
            yolo(requestOptions);
            

        });

        const yolo = async(requestOptions) => {
            var res = await fetch("https://worker-greenglobe2.juliewq25.workers.dev/", requestOptions);
            var data = await res.json();
            console.log(data);
        }


    },
    methods: {
        countryClicked() {
            this.$router.push({
                name: 'countryInfo',
                params: {
                    countryName: countryName
                }
            });
            console.log(countryName)
        }
    },
}


</script>