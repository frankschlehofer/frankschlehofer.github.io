/* Progressive enhancement: without JavaScript, every section remains readable. */
// Add or edit splash lines here. One is chosen each time the page loads.
const splashMessages = [
    'Boiler up!',
    'The fridge has an API!',
    'Now with more CMAKE files!',
    'One more block...',
    'Beware of off-by-one!',
    'It compiled! Somehow!',
    'Keep your inventory!',
    'No creepers in the lab!',
    'The cake is in the fridge!',
    'Basketball after this!',
    'Leg day is not optional!',
    'Touch grass blocks!',
    'Simulation says yes!',
    'Powered by redstone?'
];
const splash = document.querySelector('.splash');
if (splash) {
    splash.textContent = splashMessages[Math.floor(Math.random() * splashMessages.length)];
}

const sections = [...document.querySelectorAll('main > section')];
const names = {about: 'About Me', experience: 'Experience', projects: 'Projects', classwork: 'Skills & Education', contact: 'Get in Touch', resume: 'Résumé', world: 'Explore World'};

document.documentElement.classList.add('enhanced');

for (const section of sections.filter(section => !['home', 'world'].includes(section.id))) {
    let selectedCard = null;
    let updateActions = () => {};
    const container = section.querySelector('.container');
    const heading = section.querySelector('h2');
    heading.tabIndex = -1;
    const top = document.createElement('div');
    top.className = 'section-heading';
    const breadcrumb = document.createElement('a');
    breadcrumb.href = '#home';
    breadcrumb.className = 'breadcrumb';
    breadcrumb.textContent = '← Main Menu';
    heading.before(top);
    top.append(breadcrumb, heading);
    const label = document.createElement('p');
    label.className = 'section-caption';
    label.textContent = ({about: 'The person behind the projects.', experience: 'Learning by building. Growing with a team.', projects: 'From everyday problems to flight physics.', classwork: 'The tools and foundations I build with.', contact: 'Have an idea? Let’s talk.', resume: 'Professional experience, all in one place.'})[section.id];
    top.append(label);

    const cards = [...section.querySelectorAll('.timeline-item, .project-card')];
    if (cards.length) {
        const browser = document.createElement('div');
        browser.className = 'content-browser';
        const list = document.createElement('nav');
        list.className = 'entry-list';
        list.setAttribute('aria-label', `${names[section.id]} entries`);
        const detail = document.createElement('div');
        detail.className = 'entry-detail';
        detail.id = `${section.id}-detail`;
        const items = [];
        cards.forEach((card, index) => {
            const title = card.querySelector('h3, h4').textContent;
            const date = card.querySelector('.project-date, .timeline-date')?.textContent || '';
            const company = card.querySelector('.timeline-content > h4')?.textContent;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'entry-button';
            button.setAttribute('aria-controls', detail.id);
            const icon = document.createElement('span');
            icon.className = `entry-icon icon-${index % 4}`;
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = section.id === 'experience' ? ['G', 'P', 'H'][index] : ['H', 'F', '01', 'ML', '>_'][index % 5];
            const text = document.createElement('span');
            const name = document.createElement('strong');
            name.textContent = title;
            const meta = document.createElement('small');
            const technologies = [...card.querySelectorAll('.tech-tag')].slice(0, 4).map(tag => tag.textContent).join(' · ');
            meta.textContent = company ? `${company} · ${date}` : `${technologies}${technologies && date ? ' · ' : ''}${date}`;
            text.append(name, meta);
            const arrow = document.createElement('span');
            arrow.className = 'entry-chevron';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = '›';
            button.append(icon, text, arrow);
            list.append(button);
            card.hidden = true;
            detail.append(card);
            button.addEventListener('click', () => {
                select(index);
                // Announce the updated detail without moving keyboard focus away from the list.
                announcement.textContent = `Showing ${title}`;
            });
            items.push({button, card});
        });
        function select(index) {
            selectedCard = items[index].card;
            items.forEach((item, i) => {
                item.card.hidden = i !== index;
                item.button.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
            updateActions();
        }
        browser.append(list, detail);
        // Replace the emptied layout wrappers; every original entry is now in the detail panel.
        section.querySelector('.timeline, .featured-projects')?.remove();
        section.querySelector('.other-projects')?.remove();
        container.append(browser);
        select(0);
    }
    const actions = document.createElement('div');
    actions.className = 'section-actions';
    const back = document.createElement('a');
    back.href = '#home';
    back.className = 'menu-button';
    back.textContent = '← Main Menu';
    const contact = document.createElement('a');
    contact.href = section.id === 'contact' ? 'mailto:franklschlehofer@gmail.com' : '#resume';
    contact.className = 'menu-button primary';
    contact.textContent = section.id === 'contact' ? 'Send an Email ↗' : 'Read Résumé ↗';
    updateActions = () => {
        const link = selectedCard?.querySelector('.project-links a, a.project-link');
        if (section.id !== 'projects') return;
        contact.href = link ? link.href : '#contact';
        contact.textContent = link ? (link.href.includes('github.com') ? 'View on GitHub ↗' : 'Open Project ↗') : 'Ask About This Project ↗';
        if (link) {
            contact.target = '_blank';
            contact.rel = 'noopener noreferrer';
        } else {
            contact.removeAttribute('target');
            contact.removeAttribute('rel');
        }
    };
    updateActions();
    actions.append(back, contact);
    container.append(actions);
}

const announcement = document.createElement('div');
announcement.className = 'sr-only';
announcement.setAttribute('role', 'status');
document.body.append(announcement);

let worldSession = null;
let worldRequest = 0;

function route({focus = true} = {}) {
    if (location.hash === '#main-content') {
        document.getElementById('main-content').focus();
        return;
    }
    const requested = location.hash.slice(1) || 'home';
    const id = sections.some(section => section.id === requested) ? requested : 'home';
    sections.forEach(section => { section.hidden = section.id !== id; });
    worldRequest++;
    const request = worldRequest;
    worldSession?.dispose();
    worldSession = null;
    document.body.classList.toggle('in-section', id !== 'home');
    document.body.classList.toggle('in-world', id === 'world');
    if (id === 'world') {
        import('./world/interface.mjs').then(module => {
            if (request === worldRequest) worldSession = module.mountWorld(document.getElementById('world'));
        }).catch(error => {
            if (request !== worldRequest) return;
            document.querySelector('.world-status').textContent = 'The world could not load. Use All projects or All experience below.';
            document.getElementById('world').dataset.state = 'failed';
            console.warn('World loading failed:', error.message);
        });
    }
    document.title = `${id === 'home' ? 'Portfolio' : names[id]} — Frank Schlehofer`;
    window.scrollTo({top: 0, behavior: 'instant'});
    if (focus && id !== 'home') document.querySelector(`#${id} h2`).focus({preventScroll: true});
    if (focus && id === 'home') {
        const title = document.getElementById('home-title');
        title.tabIndex = -1;
        title.focus({preventScroll: true});
    }
}
window.addEventListener('hashchange', () => route());
route({focus: false});
