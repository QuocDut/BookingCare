//load FB SDK
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

window.extAsyncInit = function() {
    // the Messenger Extensions JS SDK is done loading

    MessengerExtensions.getContext("752170935271841",
        function success(thread_context){
            // success
            //set psid to input
            $("#psid").val(thread_context.psid);
            handleClickButtonBooking();
        },
        function error(err){
            // error
            console.log(err);
        }
    );
};

//validate inputs
function validateInputFields() {
    const PHONE_REG = /((0[2|3|4|5|6|7|8|9]|01[2|6|8|9])+([0-9]{8})|(84[2|3|4|5|6|7|8|9]|841[2|6|8|9])+([0-9]{8}))\b/g;

    let reason = $("#reason");
    let phone = $("#phone");

    if (!phone.val().match(PHONE_REG)) {
        phone.addClass("is-invalid");
        return true;
    } else {
        phone.removeClass("is-invalid");
    }

    if (reason.val() === "") {
        reason.addClass("is-invalid");
        return true;
    } else {
        reason.removeClass("is-invalid");
    }

    return false;
}

function handleClickButtonBooking(){
    $("#btnBooking").on("click", function(e) {
        let check = validateInputFields();
        let data = {
            psid: $("#psid").val(),
            customerName: $("#customerName").val(),
            phone: $("#phone").val(),
            reason: $("#reason").val()
        };

        if(!check) {
            //close webview
            MessengerExtensions.requestCloseBrowser(function success() {
                // webview closed
            }, function error(err) {
                // an error occurred
                console.log(err);
            });

            //send data to node.js server
            $.ajax({
                url: `${window.location.origin}/set-info-booking-online-messenger`,
                method: "POST",
                data: data,
                success: function(data) {
                    console.log(data);
                },
                error: function(error) {
                    console.log(error);
                }
            })
        }
    });
}
