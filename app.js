//  Tabbed component for The Guardian. 2 hours max.

const Guardian = 'https://content.guardianapis.com'
const sections = ['uk-news', 'travel', 'football']



// User submits an API key to retrieve the data. 

const start = (override = false) => {
	const errorMsg = 'Get an API key from open-platform.theguardian.com'
	const key = override || document.getElementById('key').value
  if (!key) alert(errorMsg)
  getData(key, sections)
  .then(data => {
    ReactDOM.render(<App data={data} />, document.getElementById('app'))
 	})
  .catch(error => {
  	alert(error)
  	//alert(`Invalid API Key. ${errorMsg}`)
  })
}



// Make the request using the ES6 fetch API. If we were using async/await this would be like, half the length and about 10x as elegant, but it isn't working in jsFiddle (https://github.com/jsfiddle/jsfiddle-issues/issues/923) so that's that .then().
    
const getData = (key, sections) =>
  Promise.all(sections.map(section => {
  	return new Promise((resolve, reject) => {
      fetch(`${Guardian}/${section}?api-key=${key}`)
      .then(request => request.json())
      .then(json => resolve(json.response.results))
      .catch(reject)
  	})
   }))



// The React component. It should be functional without Javascript so we're going to use React to replicate the 'Functional Tabs' concept found here: https://codepen.io/una/pen/KgRzRE using HTML and CSS. We're also going to throw in a little emoji convertor because the brief wanted something creative and emoji's are creative, right? 🤷 We'd like it to be lightweight, so in an ideal world I'd just hand-generate the HTML without including React but I only have two hours so going to have to React it.

class App extends React.Component {
	constructor() {
  	super()
    this.state = { emoji: false, ramsay: false }
  }
	toggleEmoji(e) {
  	this.setState({ emoji: e.target.checked })
    if (this.state.ramsay) {
  		this.setState({ ramsay: false })
      document.getElementById('ramsay').checked = false
    }
  }
	toggleRamsay(e) {
  	this.setState({ ramsay: e.target.checked })
    if (this.state.emoji) {
  		this.setState({ emoji: false })
      document.getElementById('emoji').checked = false
    }
  }
  render() {
		const tabs = this.props.data
    return (
    	<div>
        <div className='options'>
          <div>
            <input
              type="checkbox"
              name="tabgroup"
              id="emoji"
              onChange={this.toggleEmoji.bind(this)}
            />
            <label className="emoji" htmlFor="emoji">🤔 Emoji?</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="tabgroup"
              id="ramsay"
              onChange={this.toggleRamsay.bind(this)}
            />
            <label className="ramsay" htmlFor="ramsay">👨‍🍳 Gordon Ramsay?</label>
          </div>
        </div>
        <input type="radio" name="tabgroup" id="tab0" defaultChecked={true} />
        <label htmlFor="tab0">{tabs[0][0].sectionName}</label>
        <input type="radio" name="tabgroup" id="tab1" />
        <label htmlFor="tab1">{tabs[1][0].sectionName}</label>
        <input type="radio" name="tabgroup" id="tab2" />
        <label htmlFor="tab2">{tabs[2][0].sectionName}</label>
		    <div className="content">{
        	tabs.map((rows, i) => {
          	const id = `content${i}`
          	return <Content rows={rows} key={i} id={id}
            emoji={this.state.emoji} ramsay={this.state.ramsay} />
        	})}
        </div>
      </div>
    )
  }
}



// And a separate component to render out each pane. Also, our emoji/ramsay logic can live in here. We'll render it out.

class Content extends React.Component {
  render() {
  	return (
    	<div id={this.props.id}>
    	  <ol>
          {this.props.rows.map((row, i) => {
            let text = (this.props.emoji) ? emojifyText(row.webTitle) : row.webTitle
            
            // Our Ramsayfier, it's a bit of a lame gag but It's Sunday morning. So we pick some common words that Gordon Ramsay might say the word 'fucking' after. Then we use a regex to stop 'doublefucks' which is where a compound stop word like 'in a' is parsed as 'in fucking a fucking', which isn't really gramatically valid. Even for our man Gordon Ramsay. Having capitalised, we throw an arbitrary number of exclaimation marks at the end of the headline to approximate passionate kitchen-based enthusiasm.
            
            if (this.props.ramsay) {
            	text = ` ${text.toUpperCase()}`
            	const stopwords = ['THE', 'AND',  'FOR',  'OVER', 'TO',  'ITS', 'AFTER', 'A', 'ON', 'IN', 'AS', 'IT', 'AT', 'IS', 'SAYS', 'THIS', 'NEXT', 'OF', 'OUR']
              stopwords.map(word => text = text.split(` ${word} `).join(` ${word} FUCKING `))
              const replacer = (match, p1, p2, p3) => [p2, p3].join(' ')
              text = text.replace(/(FUCKING) (\w+) (FUCKING)/g, replacer)
            	text = text += (new Array(Math.floor(Math.random() * 6) + 1)).fill('!').join('')
            }
            return (<li><a href={row.webUrl} target="_blank" >{text.trim()}</a></li>)
          })}
        </ol>
    	</div>
    )
  }
}

// And that's time up. That was fun, let's do it again some time!

