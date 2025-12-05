import React from "react";
import { Link } from "react-router-dom";

const CustomFooter = ({ mode, setOpen }) => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-10">
      <div className="container mx-auto px-4 space-y-8">
        {/* Disclaimer Section */}
        <div className="border border-rose-700 p-4 rounded">
          <h3 className="text-lg font-bold mb-4 text-center">Disclaimer</h3>
          <p className="text-xs text-gray-400">
            Accessing and using matkatricksearch.in is entirely at your own
            risk. All content on this website is provided solely for
            informational purposes and is based on astrology and numerical
            calculations. We are not associated with, nor do we endorse, any
            illegal Matka or gambling operations.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Continued use of the site is solely at your discretion and may
            render you responsible for any resulting damages, losses, or legal
            actions. If you do not agree with this disclaimer, please exit the
            site immediately. Unauthorized reproduction or distribution of any
            content is strictly prohibited.
          </p>
        </div>

        {/* Matka Tags Section */}
        <div className="border border-rose-700 p-4 rounded">
          <h3 className="text-lg font-bold mb-4 text-center">Matka</h3>
          <div className="flex flex-row flex-wrap gap-2 justify-center">
            {[
              "matkatricksearch.in",
              "matkatricksearch",
              "Madhur Matka",
              "Satta Bazar",
              "Satta Kurla",
              "Satta Com",
              "Satta Batta",
              "Org Mobi Net In",
              "Satta Master",
              "Matka Game",
              "Kapil Indian Matka",
              "Matka Parivar 24",
              "Prabhat Matka",
              "Tara Matka",
              "Golden Matka",
              "SattaMatka.Com",
              "Madhur Matka satta result chart",
              "satta khabar",
              "matka India net",
              "satakmatak",
              "satta chart 2019",
              "satta bazar result",
              "satta live",
              "satta bazar",
              "satta matka Mumbai chart",
              "satta live result",
              "satta fast result",
              "satta fast",
              "satta today Number 10",
              "Satta Matka",
            ].map((tag, index) => (
              <span
                key={index}
                className="bg-gray-800 px-2 py-1 rounded hover:bg-gray-700 transition text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="border border-rose-700 p-4 rounded">
          <div className="flex flex-row space-x-6 justify-center">
            <Link
              to="/"
              className="block rounded-lg px-2 py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-800"
              style={{ color: mode === "dark" ? "white" : "" }}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/chart-pattern-finder"
              className="block rounded-lg px-2 py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-800"
              style={{ color: mode === "dark" ? "white" : "" }}
            >
              Chart Pattern Finder
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-rose-700 pt-4">
          <p className="text-xs text-rose-700 text-center">
            © {new Date().getFullYear()} matkatricksearch.in All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
