import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;

    const graphqlQuery = {
      query: `
         {
          post(id: "${postId}") {
            _id
            title
            content
            imageUrl
            creator {
              name
            }
            createdAt
            updatedAt
          }
        }
      `
    };

    fetch(`http://localhost:8080/graphql`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.props.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    }).then(res => res.json())
      .then(resData => {
        if (resData.errors && resData.errors.length) {
          throw new Error('Failed to fetch status');
        }
        return resData.data.post;
      })
      .then(resData => {
        this.setState({
          title: resData.title,
          author: resData.creator.name,
          date: new Date(resData.createdAt).toLocaleDateString('en-US'),
          content: resData.content,
          image: `http://localhost:8080/images/${resData.imageUrl}`
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
