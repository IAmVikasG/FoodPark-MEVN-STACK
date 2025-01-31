import { useRoute } from 'vue-router';

export default function useRouteHelpers()
{
    const route = useRoute();

    // Check if the current route matches the given route name
    const isActive = (routeName) => route.name === routeName;

    // Check if any of the child routes are active for treeview
    const isTreeviewActive = (routeNames) => routeNames.includes(route.name);

    return { isActive, isTreeviewActive };
}
