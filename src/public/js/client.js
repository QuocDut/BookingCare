const PHONE_REG = /((0[2|3|4|5|6|7|8|9]|01[2|6|8|9])+([0-9]{8})|(84[2|3|4|5|6|7|8|9]|841[2|6|8|9])+([0-9]{8}))\b/g;
const EMAIL_REG = /[a-zA-Z][a-zA-Z0-9_\.]{1,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}/g;

function getScheduleDoctorByDate() {
    $('#day-book').on('change', function(event) {
        let value = $(this).val();
        let arrSplit = value.split("-");
        let date = arrSplit[1].trim();
        let doctorId = $(this).data('doctor');

        $.ajax({
            method: "POST",
            url: `${window.location.origin}/doctor/get-schedule-doctor-by-date`,
            data: { date: date, doctorId: doctorId },
            success: function(data) {
                //empty content inside div parent
                $('#div-schedule-id').html('');
                $('#div-more-info').html('');
                let html = '';
                let moreInfo = '';
                if (data.message.length > 0) {
                    data.message.forEach((schedule, index) => {
                        if (schedule.isDisable === false) {
                            html += `
                          <div id="btn-modal-${schedule.id}" data-doctorId="${schedule.doctorId}" data-date="${schedule.date}"
                                 data-time="${schedule.time}"
                                 class="text-decoration-none" onclick="openModalBooking(this.id)">
                                <div class="doctor-time">
                                    ${schedule.time}
                                </div>
                            </div>
                        `;

                        }

                        if (index === data.message.length - 1 && schedule.isDisable === true) {
                            html += `<div>
                                  There are no scheduled visits in the current timeframe. Please select the next scheduled exams.
                            </div>`
                        }


                        moreInfo = `
                         <div class="d-flex flex-column">
                                    <div>
                                                <span class="d-block mt-2">Choose <i class="fa fa-hand-o-up" aria-hidden="true"></i>  and book a free consultation</span>
                                    </div>
                                    <div style="border-top: 1px solid #ccc"
                                         class="d-flex flex-column">
                                                            <span class="d-block pt-3 pb-1"
                                                                  style="text-transform: uppercase">Address:</span>
                                        <span class="d-block pb-1"
                                              style="border-bottom: 1px solid #ccc">${data.doctor.address}</span>
                                    </div>
                                    <span class="d-block pt-2">Price: 50 USD</span>
                                </div>
                        
                        `;
                    });
                } else {
                    html = `
                            <div>
                                 Doctor "${data.doctor.name}" does not have an appointment on <b>${value}</b>. Please select the next examination schedule.
                            </div>
                    `;
                    moreInfo = '';
                }

                $('#div-schedule-id').append(html);
                if (moreInfo !== '') {
                    $('#div-more-info').append(moreInfo);
                }
            },
            error: function(error) {
                console.log(error)
            }
        });
    });
}

function specializationGetScheduleDoctorByDate() {
    $('.doctor-schedule-spe').unbind('change').bind('change', function(event) {
        let value = $(this).val();
        let arrSplit = value.split("-");
        let date = arrSplit[1].trim();
        let doctorId = $(this).data('doctor');

        $.ajax({
            method: "POST",
            url: `${window.location.origin}/doctor/get-schedule-doctor-by-date`,
            data: { date: date, doctorId: doctorId },
            success: function(data) {
                //empty content inside div parent
                $(`#div-schedule-${doctorId}`).html('');
                $(`#div-more-info-${doctorId}`).html('');
                let html = '';
                let moreInfo = '';
                if (data.message.length > 0) {
                    data.message.forEach((schedule, index) => {
                        if (schedule.isDisable === false) {
                            html += `
                          <div id="spe-btn-modal-${schedule.id}" data-doctor-id="${schedule.doctorId}" data-date="${schedule.date}"
                                 data-time="${schedule.time}"
                                 class="text-decoration-none show-modal-at-clinic-page">
                                <div class="doctor-time">
                                    ${schedule.time}
                                </div>
                            </div>
                        `;
                        }

                        if (index === data.message.length - 1 && schedule.isDisable === true) {
                            html += `<div>
                                   There are no scheduled visits in the current timeframe. Please select the next scheduled exams.
                            </div>`
                        }


                    });
                    moreInfo = `
                        <div class="d-flex flex-column">
                                            <div>
                                                <span class="d-block mt-2"> Choose <i class="fa fa-hand-o-up" aria-hidden="true"></i>  and book a free consultation</span>
                                            </div>
                                            <div style="border-top: 1px solid #ccc" class="d-flex flex-column">
                                                <span class="d-block pt-3 pb-1" style="text-transform: uppercase">Address:</span>
                                                <span class="d-block pb-1" style="border-bottom: 1px solid #ccc">${data.doctor.address}</span>
                                            </div>
                                            <span class="d-block pt-2">Price: 50 USD</span>
                         </div>
                    `;
                } else {
                    html = `
                            <div class="no-schedule">
                               
                                 Doctor "${data.doctor.name}" does not have an appointment on <b>${value}</b>. Please select the next examination schedule.

                            </div>
                    `;
                    moreInfo = '';
                }

                $(`#div-schedule-${doctorId}`).append(html);
                if (moreInfo !== '') {
                    $(`#div-more-info-${doctorId}`).append(moreInfo);
                }

            },
            error: function(error) {
                alertify.error('An error occurs, please try again later!!');
                console.log(error)
            }
        });
    });
}

function showModalAllSpecializations() {
    $('.show-all-specializations').on('click', function(e) {
        e.preventDefault();
        $('#modalAllSpecializations').modal('show');
    });
}

function showModalAllClinics() {
    $('.show-all-clinics').on('click', function(e) {
        e.preventDefault();
        $('#modalAllClinics').modal('show');
    });
}

function showModalAllDoctors() {
    $('.show-all-doctors').on('click', function(e) {
        e.preventDefault();
        $('#modalAllDoctors').modal('show');
    });
}

function showPostsForUsers() {
    let currentPage = 1;
    let total = $('#paginationForPostClient').data('total');
    if (total === 1) {
        $(' .li-next-client').addClass('disabled');
    }
    $('.page-post-next-client').on('click', function(e) {
        e.preventDefault();
        currentPage++;
        $(' .li-pre-client').removeClass('disabled');

        if (currentPage === total) {
            $(' .li-next-client').addClass('disabled');
        }
        if (currentPage > total) return;
        generatePostPagination(currentPage);
    });

    $('.page-post-pre-client').on('click', function(e) {
        e.preventDefault();
        currentPage--;
        $(' .li-next-client').removeClass('disabled');
        if (currentPage === 1) {
            $(' .li-pre-client').addClass('disabled');
        }
        if (currentPage === 0) return;
        generatePostPagination(currentPage);
    });
}

function generatePostPagination(page) {
    $.ajax({
        url: `${window.location.origin}/supporter/pagination/posts?page=${page}`,
        method: 'GET',
        success: function(data) {
            $("#list-posts-client").empty();
            let html = '';
            data.posts.rows.forEach((post) => {
                html += `
                            <a class="text-decoration-none" href="/detail/post/${post.id}">
                                <div class=" mb-5 d-flex flex-row">
                                    <div class="img-post col-4">
                                        <img src="https://cdn.bookingcare.vn/fr/w500/2018/06/18/113541benh-vien-bao-son.jpg">
                                    </div>
                                    <div class="col-8 d-flex flex-column">
                                        <h3 class="show-title-post">${post.title}</h3>
                                        <div class="show-content-post" style="color: black">
                                            ${post.contentHTML.replace(/<\/?[^>]+(>|$)/g, "")}
                                        </div>
                                    </div>
                                </div>
                            </a>
                `;
            });
            $("#list-posts-client").append(html);
        },
        error: function(err) {
            alertify.error('An error occurs, please try again later!');
            console.log(err)
        }
    })
}

function searchElasticClient() {
    $('#searchPostClient').on('keydown', function(event) {
        if (event.which === 13 || event.keyCode === 13) {
            let key_words = $('#searchPostClient').val();
            window.location.href = `${window.location.origin}/posts/search?keyword=${key_words}`;
        }
    });
}

function searchInSearchPost() {
    $('#searchPostInSearchPageClient').on('keydown', function(event) {
        if (event.which === 13 || event.keyCode === 13) {
            let key_words = $('#searchPostInSearchPageClient').val();
            window.location.href = `${window.location.origin}/posts/search?keyword=${key_words}`;
        }
    })
}

function searchInDetailPost() {
    $('#searchInDetailPost').on('keydown', function(event) {
        if (event.which === 13 || event.keyCode === 13) {
            let key_words = $('#searchInDetailPost').val();
            window.location.href = `${window.location.origin}/posts/search?keyword=${key_words}`;
        }
    })

}

function showExtraInfoBooking() {
    $('#viewExtraInfo').on('click', function(e) {
        if ($("#divExtraInfo").hasClass("d-none")) {
            $("#divExtraInfo").removeClass("d-none").addClass("d-block");
        } else {
            $("#divExtraInfo").removeClass("d-block").addClass("d-none");
        }
    })
}

function validateInputPageDoctor() {
    if (!$("#name").val()) {
        $("#name").addClass('is-invalid');
        return false;
    } else {
        $("#name").removeClass('is-invalid');
    }

    if (!$("#phone").val()) {
        $("#phone").addClass('is-invalid');
        return false;
    }
    if ($("#phone").val()) {
        let isValid = $("#phone").val().match(PHONE_REG);
        if (isValid) {
            $("#phone").removeClass('is-invalid');
        } else {
            $("#phone").addClass('is-invalid');
            return false;
        }
    }


    if (!$("#email").val()) {
        $("#email").addClass('is-invalid');
        return false;
    }

    if ($("#email").val()) {
        let isValid = $("#email").val().match(EMAIL_REG);
        if (isValid) {
            $("#email").removeClass('is-invalid');
        } else {
            $("#email").addClass('is-invalid');
            return false;
        }
    }
    return true;
}

function handleBookingPageDoctorNormal(formData) {
    $.ajax({
        method: "POST",
        url: `${window.location.origin}/booking-doctor-normal/create`,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
            if (typeof (data.patient) === 'string') {
                alert("Unfortunately, this appointment has enough patients booked, please choose a different time.");
                window.location.reload(true);
            } else {
                window.location.href = `${window.location.origin}/booking-info/${data.patient.id}`;
            }
        },
        error: function(error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function handleBookingPageDoctorWithoutFiles(data) {
    $.ajax({
        method: "POST",
        url: `${window.location.origin}/booking-doctor-without-files/create`,
        data: data,
        success: function(data) {
            if (typeof (data.patient) === 'string') {
                alert("Unfortunately, this appointment has enough patients booked, please choose a different time.");
                window.location.reload(true);
            } else {
                window.location.href = `${window.location.origin}/booking-info/${data.patient.id}`;
            }

        },
        error: function(error) {
            alertify.error('An error occurs, please try again later!');
            console.log(error);
        }
    });
}

function handleBookingPageDoctor() {
    $("#btn-confirm-booking").on("click", function(event) {
        let check = validateInputPageDoctor();
        if (check) {
            $(this).prop('disabled', true);
            $('#processLoading').removeClass('d-none');
            let formData = new FormData($('form#form-patient-info')[0]);
            //contain file upload
            let doctorId = $('#infoDoctor').data('doctor-id');
            let time = $('#time-patient-booking').text();
            let date = $('#date-patient-booking').text();

            if ($('#oldForms').val()) {
                formData.append("doctorId", doctorId);
                formData.append('timeBooking', time);
                formData.append('dateBooking', date);
                handleBookingPageDoctorNormal(formData);
            } else {

                let data = {
                    doctorId: doctorId,
                    timeBooking: time,
                    dateBooking: date,
                };
                for (let pair of formData.entries()) {
                    data[pair[0]] = pair[1]
                }
                delete data.oldForms;
                handleBookingPageDoctorWithoutFiles(data);
            }
        }
    });
}

function showModalBookingClinicPage() {
    $("#clinicRightContent").on('click', '.show-modal-at-clinic-page', function() {
        let id = $(this).attr('id');
        let doctorId = $(`#${id}`).data('doctor-id');
        let date = $(`#${id}`).data('date');
        let time = $(`#${id}`).data('time');
        let formData = new FormData();
        formData.append('id', doctorId);

        let data = {};
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: "POST",
            url: `${window.location.origin}/api/get-info-doctor-by-id`,
            data: data,
            success: function(data) {
                $('#infoDoctorSpe').attr('data-doctor-id', doctorId);
                $('#modal-avatar-doctor-spe').attr('src', `/images/users/${data.doctor.avatar}`);
                $('#doctor-name-spe').text(`${data.doctor.name}`);
                $('#time-patient-booking').text(`${time}`);
                $('#date-patient-booking').text(`${date}`);
                $('#doctor-address-spe').text(`${data.doctor.address}`);
                $('#modalBookingClinicDoctor').modal('show');
            },
            error: function(error) {
                alertify.error('An error occurs, please try again later!!');
                console.log(error);
            }
        })
    })
}

function handleBookingPageClinic() {
    $('#btn-confirm-booking-spe').on('click', function(e) {
        let check = validateInputPageDoctor();
        if (check) {
            $(this).prop('disabled', true);
            $('#processLoading').removeClass('d-none');
            let time = $('#time-patient-booking').text();
            let date = $('#date-patient-booking').text();

            let formData = new FormData($('form#form-patient-info-spe')[0]);
            //contain file upload
            let doctorId = $('#infoDoctorSpe').attr('data-doctor-id');
            if ($('#oldForms').val()) {
                formData.append("doctorId", doctorId);
                formData.append('timeBooking', time);
                formData.append('dateBooking', date);
                handleBookingPageDoctorNormal(formData);
            } else {

                let data = {
                    doctorId: doctorId,
                    timeBooking: time,
                    dateBooking: date,
                };
                for (let pair of formData.entries()) {
                    data[pair[0]] = pair[1]
                }
                delete data.oldForms;
                handleBookingPageDoctorWithoutFiles(data);
            }
        }
    });
}

function showModalBookingSpecializationPage() {
    $("#specializationDoctor").on('click', '.show-modal-at-clinic-page', function() {
        let id = $(this).attr('id');
        let doctorId = $(`#${id}`).data('doctor-id');
        let date = $(`#${id}`).data('date');
        let time = $(`#${id}`).data('time');
        let formData = new FormData();
        formData.append('id', doctorId);

        let data = {};
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: "POST",
            url: `${window.location.origin}/api/get-info-doctor-by-id`,
            data: data,
            success: function(data) {
                $('#infoDoctorSpe').attr('data-doctor-id', doctorId);
                $('#modal-avatar-doctor-spe').attr('src', `/images/users/${data.doctor.avatar}`);
                $('#doctor-name-spe').text(`${data.doctor.name}`);
                $('#time-patient-booking').text(`${time}`);
                $('#date-patient-booking').text(`${date}`);
                $('#doctor-address-spe').text(`${data.doctor.address}`);
                $('#modalBookingSpe').modal('show');
            },
            error: function(error) {
                alertify.error('An error occurs, please try again later!!');
                console.log(error);
            }
        })
    })
}

function validateFeedback() {
    if (!$("#feedbackName").val()) {
        $("#feedbackName").addClass('is-invalid');
        return false;
    } else {
        $("#feedbackName").removeClass('is-invalid');
    }
    if (!$("#feedbackPhone").val()) {
        $("#feedbackPhone").addClass('is-invalid');
        return false;
    } else {
        $("#feedbackPhone").removeClass('is-invalid');
    }

    if (!$("#feedbackContent").val()) {
        $("#feedbackContent").addClass('is-invalid');
        return false;
    } else {
        $("#feedbackContent").removeClass('is-invalid');
    }

    return true;
}

function handleSubmitFeedback() {
    $('#sendFeedback').on('click', function(e) {

        let doctorId = $(this).attr('data-doctor-id');
        let formData = new FormData($('form#formFeedBack')[0]);
        let data = {
            doctorId: doctorId
        };
        for (let pair of formData.entries()) {
            data[pair[0]] = pair[1]
        }
        $.ajax({
            method: 'POST',
            url: `${window.location.origin}/feedback/create`,
            data: { data: data },
            success: function(data) {
                alert("Sending a Feedback succeeds!")
            },
            error: function(err) {
                alertify.error('An error occurs, please try again later!');
                console.log(error);
            }
        })
    })
}

$('html').click(function(e) {
    if (e.target.id === 'input-search') {
        //pass
    } else {
        //click outside inputSearch
        $('#show-info-search').css('display', 'none');
    }
});

function handleSearchHomepage() {
    $('#input-search').on('keyup', function(e) {
        if (e.keyCode === 13) {
            let keyword = $('#input-search').val();
            $.ajax({
                url: `${window.location.origin}/search-homepage`,
                method: 'POST',
                data: { keyword: keyword },
                success: function(data) {
                    let html = '';
                    $('#show-info-search').empty();

                    if (data.clinics.length === 0 && data.specializations.length === 0 && data.doctors.length === 0) {
                        html += `
                         <div class="child-info">
                               No search results found
                        </div>
                        `;
                    }

                    data.doctors.forEach((doctor) => {
                        html += `
                         <div class="child-info">
                                <a href="detail/doctor/${doctor.id}">Doctor - ${doctor.name}</a>
                        </div>
                        `;
                    });

                    data.clinics.forEach((clinic) => {
                        html += `
                         <div class="child-info">
                                <a href="detail/clinic/${clinic.id}">Clinic - ${clinic.name}</a>
                        </div>
                        `;
                    });

                    data.specializations.forEach((specialization) => {
                        html += `
                         <div class="child-info">
                                <a href="detail/specialization/${specialization.id}">Specialist - ${specialization.name}</a>
                        </div>
                        `;
                    });


                    $('#show-info-search').css('display', 'block');
                    $('#show-info-search').append(html);
                },
                error: function(error) {
                    alertify.error('An error occurs, please try again later!');
                    console.log(error);
                }
            });
        }
    });
}

$(document).ready(function(e) {
    getScheduleDoctorByDate();
    specializationGetScheduleDoctorByDate();
    showModalAllSpecializations();
    showModalAllClinics();
    showModalAllDoctors();
    showPostsForUsers();
    searchElasticClient();
    searchInSearchPost();
    searchInDetailPost();
    showExtraInfoBooking();
    handleBookingPageDoctor();
    showModalBookingClinicPage();
    showModalBookingSpecializationPage();
    handleBookingPageClinic();
    handleSubmitFeedback();
    handleSearchHomepage();
});
