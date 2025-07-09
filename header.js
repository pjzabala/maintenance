// Dropdown behavior
        const dropdownWrappers = document.querySelectorAll(".dropdown-wrapper");
        dropdownWrappers.forEach((wrapper) => {
          const dropdown = wrapper.querySelector(".dropdown");

          wrapper.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".dropdown").forEach((d) => {
              if (d !== dropdown) d.style.display = "none";
            });
            dropdown.style.display =
              dropdown.style.display === "block" ? "none" : "block";
          });
        });

        document.addEventListener("click", () => {
          document.querySelectorAll(".dropdown").forEach((dropdown) => {
            dropdown.style.display = "none";
          });
        });