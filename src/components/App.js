import React from "react";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext.js";
import registrationWrong from "../images/Union-not.svg";
import registrationOk from "../images/Union-yes.svg";
import Header from "./Header";
import Footer from "./Footer.js";
import Main from "./Main.js";
import PopupWithForm from "./PopupWithForm.js";
import ImagePopup from "./ImagePopup.js";
import EditProfilePopup from "./EditProfilePopup.js";
import EditAvatarPopup from "./EditAvatarPopup.js";
import AddPlacePopup from "./AddPlacePopup.js";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import Login from "./Login.js";
import Register from "./Register.js";
import InfoTooltip from "./InfoTooltip.js";
import ProtectedRoute from "./ProtectedRoute.js";
import * as auth from "../utils/auth.js";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [isImagePopupOpen, setImagePopupOpen] = React.useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  const [selectedCard, setSelectedCard] = React.useState({});

  const [currentUser, setCurrentUser] = React.useState({});

  const [cards, setCards] = React.useState([]);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const history = useHistory();
  const [message, setMessage] = React.useState({ iconPath: "", text: "" });

  React.useEffect(() => {
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([info, data]) => {
        setCurrentUser(info);
        setCards(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);

    api
      .changeLikeCardStatus(card._id, isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((currentCard) =>
            currentCard._id === card._id ? newCard : currentCard
          )
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        const newCards = cards.filter((element) => element !== card);
        setCards(newCards);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  React.useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      auth
        .getContent(jwt)
        .then((res) => {
          setLoggedIn(true);
          setEmail(res.data.email);
          history.pushState("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [history]);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleCardClick(card) {
    setSelectedCard(card);

    setImagePopupOpen(true);
  }

  function handleUpdateUser({ name, about }) {
    api
      .editUserInfo(name, about)
      .then((info) => {
        setCurrentUser(info);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateAvatar({ avatar }) {
    api
      .editUserAvatar(avatar)
      .then((info) => {
        setCurrentUser(info);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleAddPlaceSubmit({ name, link }) {
    api
      .addCard(name, link)
      .then((data) => {
        setCards([data, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleInfoTooltipOpen() {
    setIsTooltipOpen(true);
  }

  function handleInfoTooltipContent({ iconPath, text }) {
    setMessage({ iconPath: iconPath, text: text });
  }

  function handleSignOut() {
    setLoggedIn(false);
    localStorage.removeItem("jwt");
    setEmail("");
    history.push("/sign-in");
  }

  function registration({ email, password }) {
    auth
      .register(email, password)
      .then((res) => {
        if (res.status === 201) {
          handleInfoTooltipContent({
            iconPath: registrationOk,
            text: "Вы успешно зарегистрировались!",
          });
          handleInfoTooltipOpen();
          setTimeout(history.push, 3000, "/sign-in");
          setTimeout(closeAllPopups, 2500);
        }
        if (res.status === 400) {
          handleInfoTooltipContent({
            iconPath: registrationWrong,
            text: "Введенный email уже зарегистрирован!",
          });
          handleInfoTooltipOpen();
          setTimeout(closeAllPopups, 2500);
        }
      })
      .catch((err) => {
        handleInfoTooltipContent({
          iconPath: registrationWrong,
          text: "Что-то пошло не так! Попробуйте еще раз!",
        });
        handleInfoTooltipOpen();
        setTimeout(closeAllPopups, 2500);
        console.log(err);
      });
  }

  function authorization({ email, password }) {
    auth
      .authorize({ email, password })
      .then((data) => {
        if (!data) {
          throw new Error("Произошла ошибка");
        }
        setLoggedIn(true);
        handleInfoTooltipContent({
          iconPath: registrationOk,
          text: "Вы успешно авторизованы!",
        });
        handleInfoTooltipOpen();
        setTimeout(history.push, 3000, "/");
        setTimeout(closeAllPopups, 2500);
      })
      .catch((err) => {
        handleInfoTooltipContent({
          iconPath: registrationWrong,
          text: "Что-то пошло не так! Попробуйте еще раз!",
        });
        handleInfoTooltipOpen();
        setTimeout(closeAllPopups, 2500);
        console.log(err);
      });
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setImagePopupOpen(false);
    setIsTooltipOpen(false);
    setSelectedCard({
      isOpen: false,
      link: "",
      name: "",
    });
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page">
        <div className="page__container">
          <Header
            loggedIn={loggedIn}
            email={email}
            handleSignOut={handleSignOut}
          />

          <Switch>
            <Route path="/sign-in">
              <Login authorization={authorization} />
            </Route>
            <Route path="/sign-up">
              <Register registration={registration} />
            </Route>
            <ProtectedRoute
              exact
              path="/"
              component={Main}
              onEditProfile={handleEditProfileClick}
              onAddPlace={handleAddPlaceClick}
              onEditAvatar={handleEditAvatarClick}
              onCardClick={handleCardClick}
              onCardLike={handleCardLike}
              cards={cards}
              onCardDelete={handleCardDelete}
              loggedIn={loggedIn}
            ></ProtectedRoute>

            <Route path="/">
              {loggedIn ? <Redirect to="/main" /> : <Redirect to="/sign-in" />}
            </Route>
          </Switch>
          <Footer />

          <InfoTooltip
            isOpen={isTooltipOpen}
            onClose={closeAllPopups}
            message={message}
          />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <PopupWithForm
            title="Вы уверены?"
            name="popup-delete-img"
            buttonText="Да"
            onClose={closeAllPopups}
          ></PopupWithForm>
          <ImagePopup
            card={selectedCard}
            isOpen={isImagePopupOpen}
            onClose={closeAllPopups}
          />
        </div>
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
