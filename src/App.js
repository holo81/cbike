import React, { Component } from 'react';
import { withState, pure, compose } from 'recompose';
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

class StationListPure extends Component {
    constructor(props) {
      super(props);
    }
    
    
    render() {
      
      if (this.props.data.loading) {
        return <p>Loading ...</p>;
      }
      if (this.props.data.error) {
        return <p>{this.props.data.error.message}</p>;
      }
      console.log(this.props.data.nearest)
      return <table>
      <thead><tr><th>Place</th><th>Distance</th><th>Bikes Available</th><th>Places empty</th></tr></thead>
      <tbody>
      {this.props.data.nearest.edges.map(ch => <tr key={ch.node.place.stationId}>
      <td>
      <a href={`https://maps.google.com?&dirflg=b&saddr=Current+Location&daddr=${ch.node.place.lat},${ch.node.place.lon}`}>{ch.node.place.name}</a>
      </td>
      <td>{ch.node.distance} m</td>
      <td>{ch.node.place.bikesAvailable}</td>
      <td>{ch.node.place.spacesAvailable}</td>
      </tr>)}
      </tbody>
      </table>;
    }
  }

const queryData = graphgql(`
query foo($lat:Float, $lon:Float, $maxDistance:Int, $maxResults:Int) {nearest(lat:$lat, lon:$lon, maxDistance:$maxDistance, maxResults:$maxResults, filterByPlaceTypes:[BICYCLE_RENT])
  {edges
    {node
      {id
        distance
        place {
          __typename
          ... on BikeRentalStation{id
            stationId
            name
            bikesAvailable
            spacesAvailable
            lon
            lat
          }
        }
      }
    }
  }
}
`, {
    options: (ownProps) => ({
      variables: {
        lat: ownProps.state.lat,
        lon: ownProps.state.lon,
        maxDistance: 10000,
        maxResults: 500
      }
    }),
});

const StationSearchResults = compose(
  data,
  pure,
)(StationListPure);

const location = withState('location', {lat:0, lon:0})

function getLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
    var crd = pos.coords;
    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
    }
    , (err) => {console.warn(`ERROR(${err.code}): ${err.message}`);}
    , {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  }
  
  
  
  
  
  const NewChannelsListWithData = graphql(newQuery
  })(StationList);
  
  class App extends Component {
    render() {
      return (
      <ApolloProvider client={client}>
      <div className="App">
      <div className="App-header">
      <h2>HSL Citybikes</h2>
      </div>
      <NewChannelsListWithData />
      </div>
      </ApolloProvider>
      );
    }
  }
  export default App;