import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../utils/routing'

export function useRouting() {
  const navigate = useNavigate()
  const params = useParams()

  return {
    navigate,
    goToLanding: () => navigate(ROUTES.LANDING),
    goToDashboard: () => navigate(ROUTES.DASHBOARD),
    goToCreateFromScratch: () => navigate(ROUTES.CREATE_FROM_SCRATCH),
    goToCreateFromPDF: () => navigate(ROUTES.CREATE_FROM_PDF),
    goToCreateFromLinkedIn: () => navigate(ROUTES.CREATE_FROM_LINKEDIN),
    goToEditor: (id) => navigate(ROUTES.EDIT(id)),
    goToPreview: (id) => navigate(ROUTES.PREVIEW(id)),
    resumeId: params.resumeId,
  }
}
