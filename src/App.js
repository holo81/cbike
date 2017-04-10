import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  ApolloClient,
  gql,
  graphql,
  ApolloProvider,
  createNetworkInterface
} from 'react-apollo';

const client = new ApolloClient({
  networkInterface: createNetworkInterface(
    { uri: 'https://api.digitransit.fi/routing/v1/routers/finland/index/graphql' })
});

const ChannelsList = ({ data: { loading, error, bikeRentalStations } }) => {
  if (loading) {
    return <p>Loading ...</p>;
  }
  if (error) {
    return <p>{error.message}</p>;
  }
  return <ul>
    {bikeRentalStations.map(ch => <li key={ch.stationId}>{ch.name}</li>)}
  </ul>;
};

const channelsListQuery = gql`query MyQuery { bikeRentalStations {
    stationId
    name
    lat
    lon
    bikesAvailable
    spacesAvailable
  }
}
 `;

const ChannelsListWithData = graphql(channelsListQuery)(ChannelsList);
class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to Apollo</h2>
          </div>
          <ChannelsListWithData />
        </div>
      </ApolloProvider>
    );
  }
}
export default App;