/* global pluginTable */
// basic table plugin -- obviously could be refined to be more elegant and flexible,
// but this should give you an idea that I can code.

// I am making the following assumptions:
// (1) the table is called from the success method of the AJAX call
// (2) the success method will call pluginTable.init passing:
//     - data
//     - (optional) number of entries per page
//     - (optional) container ID
// (3) data is an array (obviously extracted from the JSON return) of employee objects
window.pluginTable = window.pluginTable || {};
(function (pt, undefined) {
    'use strict';
    var // add pagination controls
        addPaginator = () => {
            var dl = document.createElement('dl'),
                dt = document.createElement('dt'),
                dd = document.createElement('dd'),
                ul = document.createElement('ul');

            dt.innerHTML = 'Pages';

            for (let i = 0; i < pageCount; i += 1) {
                let li = document.createElement('li');
                li.dataset.page = i;
                li.innerHTML = i + 1;
                if (i === 0) {
                    li.className = 'pluginTable_currentPage';
                }
                li.addEventListener('click', showView, false);
                ul.appendChild(li);
            }
            dd.appendChild(ul);

            dl.appendChild(dt);
            dl.appendChild(dd);

            container.appendChild(dl);
        },

        // add a 'showing x of y' summary
        addSummary = page => {
            let len = rows.length,
                from = 1 + page * perPage,
                to = 10 + page * perPage;

            if (!document.querySelector('#pluginTable_summary')) {
                let p = document.createElement('p');
                p.id = 'pluginTable_summary';
                container.appendChild(p);
            }
            document.querySelector('#pluginTable_summary').innerHTML = `Showing ${from} - ${to > len ? len : to} of ${len}.`;
        },

        // pluginTable container
        container,

        // create a master table which will be referenced by other methods
        createTable = d => {
            var makeHeader = () => {
                    let tr = document.createElement('tr');
                    d.reduce((r, k) => {
                            let th = document.createElement('th');
                            th.innerHTML = k;
                            tr.appendChild(th);
                        }, 0);
                    return tr;
                },
                thead = document.createElement('thead'),
                t = document.createElement('table');

            thead.appendChild(makeHeader());

            t.appendChild(thead);

            return t;
        },

        // create an array of all data rows
        createRows = d => {
            d.map(o => {
                let tr = document.createElement('tr');
                Object.keys(o).reduce((r, k) => {
                    let td = document.createElement('td');
                    td.innerHTML = o[k];
                    tr.appendChild(td);
                }, 0);
                return tr;
            }).reduce((a, b) => {
                rows.push(b);
            }, 0);
        },

        // create a separate table for each page view
        createViews = () => {
            let count = 0,
                addView = () => {
                    if (count === pageCount) {
                        return;
                    }
                    let tbody = document.createElement('tbody'),
                        i = count * perPage,
                        len = i + perPage;

                    for (i; i < len; i += 1) {
                        if (rows[i]) {
                            tbody.appendChild(rows[i]);
                        }
                    }

                    views.push(tbody);

                    count += 1;

                    return addView();
                };

            addView();
        },

        // table initialised on successful receipt of data from server
        init = (data, rowsPerPage = 10, divID = 'pluginTable_container') => {
            var rowCount = data.length;

            perPage = rowsPerPage;

            // first, clear any previous table from DOM...
            container = document.querySelector(`#${divID}`);
            container.innerHTML = '';

            // ... and create a master table
            table = createTable(Object.keys(data[0]));

            // create a row for each data item
            createRows(data);

            // create views
            pageCount = rowCount % rowsPerPage === 0 ? rowCount / rowsPerPage : Math.ceil(rowCount / rowsPerPage);
            createViews();

            // add first view as default
            table.appendChild(views[0]);
            container.appendChild(table);

            // add pagination, if necessary
            if (rowCount > rowsPerPage) {
                addSummary(0, rowsPerPage);
                addPaginator();
            }
        },

        // number of pages
        pageCount,

        // rows per page
        perPage,

        // array of all data rows
        rows = [],

        // change table view on paginator click
        showView = e => {
            let old = container.querySelector('tbody'),
                target = e.target,
                page = target.dataset.page;

            // don't do anything if already on clicked page
            if (target.className === 'pluginTable_currentPage') {
                return false;
            }

            // show the appropriate page and update state
            container.querySelector('table').replaceChild(views[page], old);
            Array.from(target.parentNode.querySelectorAll('li')).map(li => {
                li.className = '';
                return li;
            });
            target.className = 'pluginTable_currentPage';
            addSummary(page);
        },

        // master table
        table,

        // page views
        views = [];

    // public methods -- at the moment only init but could add others as plugin grows
    pt.init = init;
}(pluginTable));
