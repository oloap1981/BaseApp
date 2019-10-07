import { LoadingPage } from './pages/loading/loading';

import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, AlertController, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { Storage } from '@ionic/storage';

import { HomePage } from './pages/home/home';
import { LoginPage } from './pages/login/login';

import { CommonService } from './services/shared/common.service';
import { StoreService} from './services/store/store.service';
import { AlertService } from './services/shared/alert.service';

import { Login } from './models/login/login.namespace';

import { FirebaseX } from '@ionic-native/firebase-x/ngx';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage = LoadingPage;//home
  pages: Array<{ title: string, component: any, icon: any }>;
  private pagineSenzaMenu: Array<string> = new Array("LoadingPage", "LoginPage");

  private numNotifiche_attivita = 0;
  private numNotifiche_osservazioni = 0;
  private numNotifiche_prescrizioni= 0;
  private numNotifiche_messaggi = 0;
  private numNotifiche_commenti_at = 0;
  private numNotifiche_commenti_os = 0;

  public viewMenu: boolean = false;

  constructor(
    public platform: Platform,
    public menu: MenuController,
    public statusBar: StatusBar,
    private storage: Storage,
    public splashScreen: SplashScreen,
    public commonService: CommonService,
    public storeService: StoreService,
    public alertController: AlertController,
    public toastCtrl: ToastController,
    public firebaseNative: FirebaseX,
    public alertService: AlertService
  ) {

    this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      this.initializeApp();
    });

    // set our app's pages
    this.pages = [
        { title: 'Home', component: HomePage, icon: 'home' }
    ];
  }

  async initializeApp() {
    this.storeService.initizlizeServerUrl();

    var piattaforma = "";
    if(this.platform.is("mobileweb")){
      piattaforma = "mobileweb";
    }
    if(this.platform.is("ios")){
      piattaforma = "ios";
    }
    if(this.platform.is("android")){
      piattaforma = "android";
    }
    

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

    //carico le notifiche per le pagine nel menu
    this.storeService.getUserDataPromise().then((val: Login.ws_Token) => {
      if(val != null){
        //login già fatto, ottengo il token dell'utente
        var tokenValue = val.token_value;
        
      } else {
        // devo effettuare il login
        this.nav.setRoot(LoginPage);
      }
      
    });

    // Listen to incoming messages (MESSAGGI DA FIREBASE - NOTIFICHE)
    this.firebaseNative.onMessageReceived().subscribe(message =>{
      let id = 0;
      console.log("TIPO NOTIFICA: " + message.tipo_notifica);
      this.alertService.presentAlertNewPage(this.nav, message.tipo_notifica, id);
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  }

  public logOut() {
    this.storage.clear();
    this.menu.close();
    this.nav.setRoot(LoginPage);
  };

}