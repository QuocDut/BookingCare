$(document).ready(function() {
    $("#btnSetupBotFB").on("click", function(e) {
        e.preventDefault();
        $.ajax({
            url: `${window.location.origin}/set-up-bot-facebook`,
            method: "POST",
            data: {},
            success: function(data) {
                console.log(data)
            },
            error: function(err) {
                console.log(err)
            }
        })
    })
});