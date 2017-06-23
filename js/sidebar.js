function toggleNav() {
    if($('#sidenav').attr('opened') == "true"){
        $('.sidenav').css("width", "0px");
        $('#map').css("left", "0px");
        $('.topnav').css("margin-left", "0px");
        google.maps.event.trigger(map, "resize");
        $('#sidenav').attr('opened','false');
    }else{
        $('.sidenav').css("width", "250px");
        $('#map').css("left", "250px");
        $('.topnav').css("margin-left", "250px");
        google.maps.event.trigger(map, "resize");
        $('#sidenav').attr('opened','true');
    }
}
