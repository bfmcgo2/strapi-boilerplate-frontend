import { createContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Magic } from 'magic-sdk';
import { MAGIC_PUBLIC_KEY } from '../utils/urls';
import querystring from 'querystring';

const AuthContext = createContext();

const client_id = 'pJUChwm5w-gAldR66YXtuqRqhm9xTCRRlJqz5g2U04_QXWNYynzCwA78kRLJAWqG';
const client_secret = '3Bobk0CjPY53XbhvzDnfAr5R0oWwnJff73_bxKSRHu4Lov4AcADlxhb_NnSN7WhE';
const redirect_uri ='http://localhost:3000/auth_success';
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');




let magic;
export const AuthProvider = (props) => {

	const [user, setUser] = useState(null);
	const router = useRouter();

	const login = () =>{
	  const getLoginURL = (scopes) =>{
	    return 'https://www.patreon.com/oauth2/authorize/?client_id=' + client_id +
	      '&redirect_uri=' + encodeURIComponent(redirect_uri) +
	      '&scope=' + encodeURIComponent(scopes.join(' ')) +
	      '&response_type=code&show_dialog=true';
	  }

	  const url = getLoginURL([
	  	'identity',
	  	'campaigns',
	  	'campaigns.members.address',
	  	'identity[email]',
	  	'campaigns.members[email]',
	  	'campaigns.members'
	  ]);

	    // Show patreon auth popup
	  const popup = window.open(url, 'Patreon', 'height=600,width=400');

	  window.patreonCallback = async({access_token}) => {
	    

	    
	    // const response = await getAccessToken(payload);
	    // console.log(response);
	    // const tokens = await response.json();
	    // popup.close()
	  }
	}



	/**
	*Adds email to user
	*@param {string} email
	*/

	const loginUser = async(email) => {
		try {
			login()
			// await magic.auth.loginWithMagicLink({ email })
			// setUser({email})
			// router.push('/')
		} catch(err) {
			setUser(null)
		}
		
	}

	/**
	*Sets user to null
	*
	*/

	const logoutUser = async() => {
		try {
			await magic.user.logout()
			setUser(null)
			router.push('/')
		} catch(err) {

		}	
	}

	const checkUserLoggedIn = async() => {
		try {
			const isLoggedIn = await magic.user.isLoggedIn();

			if(isLoggedIn) {
				const { email } = await magic.user.getMetadata()
				setUser({ email })

				// Just for testing
				const token = await getToken();
				console.log('checkUserLoggedIn token', token)
			}
		} catch(err) {

		}
	}


	/**
	*Retrieves the Magic Issues Bearer Token
	*This allows User to make authenticated requests
	*/
	const getToken = async() => {
		try{
			const token = await magic.user.getIdToken();
			return token;
		} catch(err){

		}
	}

	useEffect(()=> {
		magic = new Magic(MAGIC_PUBLIC_KEY)

		checkUserLoggedIn();
	}, [])

	return (
		<AuthContext.Provider value={{ user, loginUser, logoutUser, getToken }}>
			{props.children}
		</AuthContext.Provider>
	)
}

export default AuthContext