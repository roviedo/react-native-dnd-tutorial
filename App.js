import React from 'react';
import { StyleSheet, Text, View, FlatList, PanResponder, Animated } from 'react-native';
import ExampleComponent from './ExampleComponent';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const items = [
  {index: 1, vehicle: 'car', 'color': getRandomColor()},
  {index: 2, vehicle: 'truck', 'color': getRandomColor()},
  {index: 3, vehicle: 'bike', 'color': getRandomColor()},
  {index: 4, vehicle: 'horse', 'color': getRandomColor()}, 
  {index: 5, vehicle: 'tricycle', 'color': getRandomColor()},
  {index: 6, vehicle: 'unicycle', 'color': getRandomColor()}, 
  {index: 7, vehicle: 'motorcyle', 'color': getRandomColor()}, 
  {index: 8, vehicle: 'suv', 'color': getRandomColor()}, 
  {index: 9, vehicle: 'pickup truck', 'color': getRandomColor()},
  {index: 10, vehicle: 'sports car', 'color': getRandomColor()},
  {index: 11, vehicle: 'slingshot', 'color': getRandomColor()},
  {index: 12, vehicle: 'station wagon', 'color': getRandomColor()}
];

//li:nth-child(odd) { background: #eee; }
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false
    };
    this.point = new Animated.ValueXY()
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        console.log(gestureState.y0);
        this.setState({ dragging: true });
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        console.log(gestureState);
        Animated.event([{y: this.point.y}])({y: gestureState.moveY});
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset();
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  reset = () => {
    this.setState({
      dragging: false
    });
  }

  renderItem = ({ item }) => {
    const color = item.index%2 === 0 ? '#000' : '#eee';
    return(
      <View style={{ padding: 16, backgroundColor: item.color, flexDirection: 'row' }}>
        <View {...this._panResponder.panHandlers}>
          <Text style={{ fontSize: 28, color: color }}>@</Text>
        </View>
        <Text style={{ textAlign: 'center', flex: 1, fontSize: 22, color: color }}>{item.vehicle}</Text>
      </View>
    );
  }

  render () {
    const { dragging } = this.state;
    return (
      <View style={styles.container}>
        { dragging && <Animated.View 
          style={{
            backgroundColor: 'black',
            zIndex: 2,
            width: '100%',
            top: this.point.getLayout().top 
          }}>
          {this.renderItem({item: {index: 3, vehicle: 'bike'}})}
        </Animated.View> }
        <FlatList
          scrollEnabled={!dragging}
          style={{width: '100%'}}
          data={items}
          renderItem={this.renderItem}
          keyExtractor={item => "" + item.index}
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
