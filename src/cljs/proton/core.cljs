(ns proton.core
  (:require [reagent.core :as r]))

(defn lol [props]
  [:div "LOL: " (pr-str props)])

(def components #js {:lol (r/reactify-component lol)})

(defn main [])

(aset js/window "components" components)
