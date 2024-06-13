function getInfo(){
	const firstName = document.getElementById('firstname');
    const lastName = document.getElementById('lastname');
    const emailAddress = document.getElementById('email');
    const message = document.getElementById('message');

    let name = firstName.value + ' ' + lastName.value;
    let email = emailAddress.value;
	let text = message.value;

	console.log(name);
    console.log(email);
    console.log(text);

    window.location.assign('formsubmit.html')
}
