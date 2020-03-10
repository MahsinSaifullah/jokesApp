import React, { Component } from 'react';
import Joke from './Joke';
import axios from 'axios';
import uuid from 'uuid/v4';
import './JokeList.css';

// https://icanhazdadjoke.com/

class JokeList extends Component {
	static defaultProps = {
		numJokesToGet: 10
	};

	constructor(props) {
		super(props);
		this.state = {
			jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
			loading: false
		};
		this.seenJokes = new Set(this.state.jokes.map(joke => joke.text));
	}

	componentDidMount() {
		if (this.state.jokes.length === 0) this.getJokes();
	}

	async getJokes() {
		try {
			let jokes = [];

			while (jokes.length < this.props.numJokesToGet) {
				const res = await axios.get('https://icanhazdadjoke.com/', {
					headers: { Accept: 'application/json' }
				});

				const newJoke = res.data.joke;
				if (!this.seenJokes.has(newJoke))
					jokes.push({ id: uuid(), text: newJoke, vote: 0 });
				else {
					console.log('Found a Duplicate');
					console.log(newJoke);
				}
			}

			this.setState(
				st => {
					return { loading: false, jokes: [...st.jokes, ...jokes] };
				},
				() => {
					window.localStorage.setItem(
						'jokes',
						JSON.stringify(this.state.jokes)
					);
				}
			);
		} catch (e) {
			alert(e);
			this.setState({ loading: false });
		}
	}

	handleVote = (id, delta) => {
		this.setState(
			st => {
				const jokes = st.jokes.map(joke =>
					joke.id === id ? { ...joke, vote: joke.vote + delta } : joke
				);

				return { jokes };
			},
			() => {
				window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes));
			}
		);
	};

	handleClick = () => {
		this.setState({ loading: true }, this.getJokes);
	};
	render() {
		const sortedJokes = this.state.jokes.sort((a, b) => b.vote - a.vote);
		const jokes = sortedJokes.map(joke => {
			return (
				<Joke
					upVote={() => this.handleVote(joke.id, 1)}
					downVote={() => this.handleVote(joke.id, -1)}
					key={joke.id}
					votes={joke.vote}
					text={joke.text}
				/>
			);
		});

		if (this.state.loading) {
			return (
				<div className='JokeList-spinner'>
					<i className='far fa-8x fa-laugh fa-spin' />
					<h1 className='JokeList-title'>Loading...</h1>
				</div>
			);
		} else {
			return (
				<div className='JokeList'>
					<div className='JokeList-sidebar'>
						<h1 className='JokeList-title'>
							<span>Dad</span> Jokes
						</h1>
						<img src='https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg' />
						<button className='JokeList-getmore' onClick={this.handleClick}>
							Fetch Jokes
						</button>
					</div>

					<div className='JokeList-jokes'>{jokes}</div>
				</div>
			);
		}
	}
}

export default JokeList;
