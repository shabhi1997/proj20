import React, { Component } from 'react'
import {View, Text, StyleSheet } from 'react-native'
import axios from 'react-native-axios'
import AsyncStorage from '@react-native-community/async-storage'
import firebase from 'react-native-firebase'

const monthDef = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

class HomeScreen extends Component{
    constructor(props) {
        super(props)
        this.state={
            states: []
        }
    }
    getmonth(dateString){// 29/04/2020 23:16:45
        console.log(dateString)
        let monthNum = Number(dateString.slice(3, 5)) //this gives 04
        console.log(monthNum)
        let month = monthDef[monthNum - 1]
        console.log(month)
    }

    async componentDidMount(){
        this.checkPermission()
        this.createNotificationListeners()
        axios.get('https://api.covid19india.org/data.json')
        .then(res => {
            const data = res.data
            // console.log(res.data)
            const states = data.statewise
            this.setState({ states })
            // console.log(this.state.states)
        })
    }

    componentWillUnmount(){
        this.notificationListener()
        this.notificationOpenedListener()
    }

    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
      }

      async getToken() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }
      }

      async createNotificationListeners() {
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            this.showAlert(title, body);
        });
      
        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            this.showAlert(title, body);
        });
      
        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            this.showAlert(title, body);
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
          //process data message
          console.log(JSON.stringify(message));
        });
      }
      
      showAlert(title, body) {
        Alert.alert(
          title, body,
          [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false },
        );
      }

    render(){
        let filteredStates = this.state.states.map((item) => item.statecode)
        console.log(filteredStates)
        return(
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'yellow'}}>
                <Text>
                    HomeScreen
                </Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({

})

export default HomeScreen