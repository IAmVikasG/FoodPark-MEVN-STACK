import { computed } from 'vue';
import { useRoute } from 'vue-router';

export default function useEditingId(validEditRoutes = [])
{
    const route = useRoute();

    const editingId = computed(() =>
    {
        if (validEditRoutes.includes(route.name))
        {
            return route.params.id || null;
        }
        return null;
    });

    return { editingId };
}
