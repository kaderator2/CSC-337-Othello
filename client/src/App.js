
/**
 * Gets the name of the current user from the browser cookie
 * @returns the name of the current user as a string
 */
function getUser(){
	let cookie = decodeURIComponent(document.cookie);
	let currentUser;
	for(let i = 0; i < cookie.length; i++) {
	    let sub = cookie.substring(i);
		if(sub.startsWith('"username":"')){
			currentUser = cookie.substring(i+12);
			break;
		}
	}
	for(let i=0; i < currentUser.length; i++){
		if(currentUser.charAt(i) == '"'){
			currentUser = currentUser.substring(0,i);
			break;
		}
	}
	return currentUser;
}

/**
 * Action for when logout button on homepage is clicked (WIP)
 */
let logoutButton = document.getElementById("logoutButton");
logoutButton.onclick = () => {
	let url = 'http://localhost:5000/logout/' + getUser();
	let p = fetch(url);
	p.then((result) => {
		return result.text();
	}).then((text) => {
		if(text == 'USER DOES NOT EXIST')
			console.log(text);
	})
	.catch((error) => {
		console.log('Error sending logout request');
		console.log(error);
	});
};