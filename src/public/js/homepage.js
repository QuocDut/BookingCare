$(document).ready(function() {
    $('.slider-nav').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        focusOnSelect: true,
        prevArrow: '<i class="fa fa-angle-left prev-custom"></i>',
        nextArrow: '<i class="fa fa-angle-right next-custom"></i>',
    });

    $('.slider-nav-posts').slick({
        slidesToShow: 2,
        slidesToScroll: 1,
        focusOnSelect: true,
        prevArrow: '<i class="fa fa-angle-left prev-custom"></i>',
        nextArrow: '<i class="fa fa-angle-right next-custom"></i>',
    });

    $(".menu-nav").on("click", function(e) {
        $(".home-nav").css("display", "block");
    });

    $(document).mouseup(function(e) {
        var container = $(".home-nav");

        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            container.hide();
        }
    });
});
