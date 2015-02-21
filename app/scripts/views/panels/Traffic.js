'use strict';

define([
    'jquery',
    'underscore',
    'backbone',
    'appEvents',
    'text!templates/traffic.html',
    'vendor/royalslider/royalSlider'
], function($, _, Backbone, appEvents, TrafficTemplate) {

    var Traffic = Backbone.View.extend({


        _data: null,

        render: function() {


            var urlStatus = 'php/urlStatus.php';
            var urlTrafficCameras = 'http://data.livetraffic.com/cameras/traffic-cam.json';
            var urlIncidentCameras = 'http://livetraffic.rta.nsw.gov.au/traffic/hazards/incident-open.json';
            var urlM4TrafficTime = 'http://livetraffic.rta.nsw.gov.au/traffic/travel_time/m4.json';


            // below code is not in use... But could be used for retrieving traffic data.
            // currently using a node server through grunt so the php proxy doesnt work.
            // There is a workaround using grunt, should work that out at some stage.

/*            var request = $.ajax({
                url: "php/proxy.php",
                data: {requrl: urlM4TrafficTime },
                dataType: 'json',
                success: function(data) {
                    console.log('sucess ', data)
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log('doh')
                }
            });*/


            /* Hardcoded links for basic integration
            Using hardcoded links, should use the web service for a production build.
             *  */
            var trafficCameras = [
                {
                    "title": "Church Street (Parramatta)",
                    "view": "Corner of Church Street and Victoria Road looking north towards Northmead.",
                    "direction": "N",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/churchst_parra.jpg"
                },
                {
                    "title": "Cumberland Highway (Merrylands)",
                    "view": "Cumberland Highway at Merrylands Road looking north towards the M4 Western Motorway.",
                    "direction": "N",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/cumberlandhwy_merrylands.jpg"
                },
                {
                    "title": "Great Western Highway (Hazelbrook)",
                    "view": "Great Western Highway at Oaklands Road looking east towards Sydney.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/greatwesternhwy_hazelbrook.jpg"
                },
                {
                    "title": "James Ruse Drive (Rosehill)",
                    "view": "James Ruse Drive at Grand Avenue looking north towards Rydalmere.",
                    "direction": "N",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/jrd_rosehill.jpg"
                },
                {
                    "title": "M4 Western Motorway (Auburn)",
                    "view": "M4 Western Motorway at Auburn looking west towards St Marys.",
                    "direction": "W",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m4_auburn.jpg"
                },
                {
                    "title": "M4 Western Motorway (Mays Hill)",
                    "view": "M4 Western Motorway at Cumberland Highway looking east towards Sydney.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m4_mayshill.jpg"
                },
                {
                    "title": "M4 Western Motorway (Minchinbury)",
                    "view": "M4 Western Motorway at Wallgrove Road looking east towards Eastern Creek.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m4_minchinbury.jpg"
                },
                {
                    "title": "M4 Western Motorway (Prospect)",
                    "view": "M4 Western Motorway at the Prospect Highway exit ramp looking east towards Parramatta.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m4_prospect.jpg"
                },
                {
                    "title": "M4 Western Motorway (St Marys)",
                    "view": "M4 Western Motorway at Mamre Road looking west towards Penrith.",
                    "direction": "W",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m4_stmarys.jpg"
                },
                {
                    "title": "M7 (Glenwood)",
                    "view": "M7 Motorway at Sunnyholt Road looking east towards Bella Vista.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m7_glenwood.jpg"
                },
                {
                    "title": "M7 at The Horsley Drive (Horsley Park)",
                    "view": "M7 Motorway at The Horsley Drive looking south towards Hoxton Park.",
                    "direction": "S",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/m7_horsleydr.jpg"
                },
                {
                    "title": "Old Windsor Road (Beaumont Hills)",
                    "view": "The intersection of Old Windsor Road and Windsor Road looking south towards Parramatta.",
                    "direction": "S",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/oldwindsorrd.jpg"
                },
                {
                    "title": "Old Windsor Road (Winston Hills)",
                    "view": "Old Windsor Road at Abbott Road looking north towards Bella Vista.",
                    "direction": "N",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/oldwindsorrd_winstonhills.jpg"
                },
                {
                    "title": "Parramatta Road (Parramatta)",
                    "view": "Parramatta Road at Woodville Road looking east towards Auburn.",
                    "direction": "E",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/parrard_parra.jpg"
                },
                {
                    "title": "Seven Hills Road (Seven Hills)",
                    "view": "Seven Hills Road at Abbot Road looking west towards Seven Hills.",
                    "direction": "W",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/sevenhillsrd_sevenhills.jpg"
                },
                {
                    "title": "Silverwater Road (Silverwater)",
                    "view": "Silverwater Road at M4 Western Motorway looking south towards Auburn.",
                    "direction": "S",
                    "href": "http://www.rms.nsw.gov.au/trafficreports/cameras/camera_images/silverwaterrd_silverwater.jpg"
                }


            ]


            var data = {
                trafficCameras: trafficCameras,
                _: _
            }

            var template = _.template(TrafficTemplate);
            var compiledTemplate = template(data);
            $(this.el).html(compiledTemplate);


            $('#content-slider-1').royalSlider({
                autoHeight: false,
                arrowsNav: true,
                fadeinLoadedSlide: false,
                imageScaleMode: 'none',
                imageAlignCenter: true,
                loop: false,
                loopRewind: true,
                numImagesToPreload: 6,
                keyboardNavEnabled: true,
                usePreloader: false,
                imgWidth: 352,
                imgHeight: 288,
                controlNavigation: 'none',
                arrowsNavAutoHide: false
            });



        }
    });

    return Traffic;

});
