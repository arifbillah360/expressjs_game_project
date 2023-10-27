function displayUnitsTab() {
  document.getElementById("player_units-tab").classList.toggle("display_units");
}
document
  .querySelector(".player_units-btn")
  .addEventListener("click", displayUnitsTab);

document.querySelectorAll(".building_tab").forEach((bldgBtn) => {
  bldgBtn.addEventListener("click", (e) => {
    console.log("ciao");
    // Remove the class that displays the buildings info panel
    document.querySelectorAll(".buildings_info-panel").forEach((building) => {
      building.classList.remove("display_info-panel");
    });

    // Add the class that displays the building info panel based on the id of the button that was pressed, even if other elements inside the btn are clicked climb the dom tree and reach for the element that has building tab class and take its id
    document
      .getElementById(`${e.target.closest(".building_tab").id}_info`)
      .classList.add("display_info-panel");
  });
});

// Close buildings info panel and display status activity default panel
document.getElementById("info_close-btn").addEventListener("click", () => {
  document.querySelectorAll(".buildings_info-panel").forEach((building) => {
    building.classList.remove("display_info-panel");
  });

  document.querySelector(".info-panel_all").classList.add("display_info-panel");
});
