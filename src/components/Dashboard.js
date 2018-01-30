import React from 'react';
import axios from 'axios';
import KeyValue from './KeyValue';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

class Dashboard extends React.Component {
  state = {
    searchText: '',
    totalTweets: 0,
    postiveTweets: 0,
    negativeTweets: 0,
    neutralTweets: 0,
    mixedTweets: 0,
    loading: false,
    loadingText: 'Analyzing Tweets',
    open: false,
    anchorEl: undefined,
  }

  updateSearchText = (value) => {
    this.setState({searchText: value})
  }

  reducer = (acc, curr, type) => {
    if(acc.Sentiment === type){
      acc + curr;
    }
  }

  showNeutralData = (element) => {
    this.setState({
      open: true,
      anchorEl: element
    })
  }

  analyzeSentiment = () => {
    this.setState({
      loading: true,
      totalTweets: 0,
      postiveTweets: 0,
      negativeTweets: 0,
      neutralTweets: 0,
      mixedTweets: 0,
      loadingText: 'Analyzing Tweets',
      error: false
    })
    axios.post('/analyzeSentiment', {
      query: this.state.searchText
    })
    .then(res => {

      console.log(res.data)
      let tt = res.data.length;

      let types = res.data.reduce((accumulator, tweet) => {
        if(tweet.Sentiment in accumulator){
          accumulator[tweet.Sentiment]++;
        }
        else {
          accumulator[tweet.Sentiment] = 1;
        }
        return accumulator
      }, {})

      this.setState({
        loading: false,
        totalTweets: tt,
        postiveTweets: types.POSITIVE || 0,
        negativeTweets: types.NEGATIVE || 0,
        mixedTweets: types.MIXED || 0,
        neutralTweets: types.NEUTRAL || 0,
      });

    })
    .catch(err => {
      this.setState({
        loading: false, 
        error: true
      })
    })
  }

  render() {
    const { searchText, loading, loadingText, error } = this.state;
    return (
      <div>
        <section style={{padding: '1em', background: '#f7f7f7'}}>
          {error && 
            <px-alert-message
              visible
              type='important'
              action='acknowledge'
              message-title='Oops!'
              message='There was an error while getting the data'
              auto-dismiss='0'>
            </px-alert-message>
          }
          <div style={{marginTop: '2em'}}>
            <KeyValue value='Search Twitter' size='gamma'/>
          </div>

          <div className='flex'>
            <TextField
              hintText="Search Phrase"
              floatingLabelText="Search Phrase" 
              value={searchText} 
              onChange={(e) => this.updateSearchText(e.target.value)}/>

            {loading &&
              <div style={styles.loading}>
                <px-spinner size='20'/>
                <div>&nbsp;{loadingText}</div>
              </div>
            }
          </div>
          <br />
          <RaisedButton 
            label="Analyze" 
            primary={true}
            onClick={(e) => this.analyzeSentiment()} />

        </section>

        <section className='flex' style={styles.counts}>
          <div className='flex'>
            <KeyValue valueKey='Total Tweets' value={this.state.totalTweets} size='alpha'/>
            <KeyValue valueKey='Positive Tweets' value={this.state.postiveTweets} size='alpha'/>
            <KeyValue valueKey='Negative Tweets' value={this.state.negativeTweets} size='alpha'/>
            <KeyValue valueKey='Neutral Tweets' value={this.state.neutralTweets} size='alpha'/>
            <KeyValue valueKey='Mixed Tweets' value={this.state.mixedTweets} size='alpha'/>
          </div>
        </section>

      </div>
    )
  }
}

const styles = {
  loading: {
    display: 'flex',
    alignSelf: 'flex-end',
    paddingBottom: '1em',
    marginLeft: '1em'
  },
  counts: {
    padding: '1em',
    background: '#fafafa',
    marginTop: '2em',
    justifyContent: 'space-evenly',
  }
}
export default Dashboard;