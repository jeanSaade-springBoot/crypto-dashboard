
  $(document).ready(function () {
	  $("#clientLogin").jqxButton({  theme:'dark', width: 130, height: 30,template: "primary" });
	  $("#clientLogin").css("display","block");
  });
 
  $("#clientLogin").click(function () {
	  window.location.href='/login';
  });

$("#signIn").click(function () {
			dataParam = {
				"userName": $('#username').val(),
				"password": $('#password').val()
			};
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: "/api/auth/signin",
				data: JSON.stringify(dataParam),
				dataType: 'json',
				async: true,
				cache: false,
				timeout: 600000,
				success: function(data) {

				if (!data.tacAccepted)
					{
						window.location.href = '/termsandconditionsconfirmation'
					}
					else {
					
						window.location.href = '/dashboard';
					}
				},
				error: function(e) {
						$("#ErrorMessage").show().html(e.responseJSON.message);
					
					console.log("ERROR : ", e);

				}
			});
});

