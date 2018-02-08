import React, { Component } from 'react';
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Facebook from './components/Facebook';
import axios from 'axios';

class App extends Component {

  state = {
    fb: false,
    google: false,
    userinfo: undefined,
  }

  handleFBLogin = (e) => {
    window.FB.api('/me', {fields: 'first_name, last_name'}, function(response) {
      this.setState({
        userinfo: response, 
        fb:true
      });
    }.bind(this));
  }

  handleFBLogout = (e) => {
    this.setState({fb: false})
  }

  render() {
    return (
      <div className='App' style={styles.container}>
        <px-branding-bar />

        {(this.state.fb || this.state.google) ?
          <Switch>
            {/* <Route exact path='/dashboard' component={Dashboard} userinfo='Abhishek' /> */}
            <Route 
              exact path='/dashboard'
              render={(props) => <Dashboard {...props} userinfo={this.state.userinfo} />} />
            <Route path='/' render={() => {
              return <Redirect to='/dashboard' />
            }}/>
          </Switch>
          :
          <div style={styles.login}>
            <Facebook 
              appId={218240972070365} 
              onLogin={this.handleFBLogin}
              onLogout={this.handleFBLogout}
              size='medium' 
              buttonText='login_with'
              showFriends='true'
              continueAs='true'
              logoutLink='false'/>
          </div>
        }
      </div>
    );
  }
}

const styles = {
  container: {
    background: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  login: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginBottom: '10em'
  },
}

export default App;
